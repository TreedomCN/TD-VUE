#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Mar 16 17:24:58 2022

@author: wei
"""

from pywss import Pyws, route, RadioMiddleware
from pywss.connector import Connector, ConnectManager
from ws4py.client.threadedclient import WebSocketClient
import Adafruit_PCA9685
import RPi.GPIO as GPIO
import time
import os, signal
import subprocess
from threading import Timer
import json

PWMA = 18
AIN1   =  22
AIN2   =  27

PWMB = 23
BIN1   = 25
BIN2  =  24
nowstatus = 'stop'
BtnPin  = 19
Gpin    = 5
Rpin    = 6
global bottomInitAngle
bottomInitAngle = 110
global topInitAngle
topInitAngle = 140
global pushP
pushP = None
global pushAd
pushAd = None
global ws
ws = None

#初始化舵机
pwm = Adafruit_PCA9685.PCA9685()
# Configure min and max servo pulse lengths
servo_min = 150  # Min pulse length out of 4096
servo_max = 600  # Max pulse length out of 4096
# 辅助功能，使设置舵机脉冲宽度更简单。
def set_servo_pulse(channel, pulse):
    pulse_length = 1000000    # 1,000,000 us per second
    pulse_length //= 60       # 60 Hz
    print('{0}us per period'.format(pulse_length))
    pulse_length //= 4096     # 12 bits of resolution
    print('{0}us per bit'.format(pulse_length))
    pulse *= 1000
    pulse //= pulse_length
    pwm.set_pwm(channel, 0, pulse)

def set_servo_angle(channel,angle):
    angle=4096*((angle*11)+500)/20000
    pwm.set_pwm(channel,0,int(angle))

# 频率设置为50hz，适用于舵机系统。
pwm.set_pwm_freq(50)
set_servo_angle(5,bottomInitAngle)  # 底座舵机 90
set_servo_angle(4,topInitAngle)  # 顶部舵机 145

time.sleep(0.5)
def b_left():
    global bottomInitAngle
    bottomInitAngle = bottomInitAngle - 10
    if bottomInitAngle < 0:
        bottomInitAngle = 0
    set_servo_angle(5,bottomInitAngle)

def b_right():
    global bottomInitAngle
    bottomInitAngle = bottomInitAngle + 10
    if bottomInitAngle > 180:
        bottomInitAngle = 180
    set_servo_angle(5,bottomInitAngle)

def b_top():
    global topInitAngle
    topInitAngle = topInitAngle - 10
    if topInitAngle < 0:
        topInitAngle = 0
    set_servo_angle(4,topInitAngle)

def b_down():
    global topInitAngle
    topInitAngle = topInitAngle + 10
    if topInitAngle > 180:
        topInitAngle = 180
    set_servo_angle(4,topInitAngle)

def t_up(speed,t_time):
        L_Motor.ChangeDutyCycle(speed)
        GPIO.output(AIN2,False)#AIN2
        GPIO.output(AIN1,True) #AIN1

        R_Motor.ChangeDutyCycle(speed)
        GPIO.output(BIN2,False)#BIN2
        GPIO.output(BIN1,True) #BIN1
        time.sleep(t_time)

def t_stop(t_time):
        L_Motor.ChangeDutyCycle(0)
        GPIO.output(AIN2,False)#AIN2
        GPIO.output(AIN1,False) #AIN1

        R_Motor.ChangeDutyCycle(0)
        GPIO.output(BIN2,False)#BIN2
        GPIO.output(BIN1,False) #BIN1
        time.sleep(t_time)

def t_down(speed,t_time):
        L_Motor.ChangeDutyCycle(speed)
        GPIO.output(AIN2,True)#AIN2
        GPIO.output(AIN1,False) #AIN1

        R_Motor.ChangeDutyCycle(speed)
        GPIO.output(BIN2,True)#BIN2
        GPIO.output(BIN1,False) #BIN1
        time.sleep(t_time)

def t_left(speed,t_time):
        L_Motor.ChangeDutyCycle(speed)
        GPIO.output(AIN2,True)#AIN2
        GPIO.output(AIN1,False) #AIN1

        R_Motor.ChangeDutyCycle(speed)
        GPIO.output(BIN2,False)#BIN2
        GPIO.output(BIN1,True) #BIN1
        time.sleep(t_time)

def t_right(speed,t_time):
        L_Motor.ChangeDutyCycle(speed)
        GPIO.output(AIN2,False)#AIN2
        GPIO.output(AIN1,True) #AIN1

        R_Motor.ChangeDutyCycle(speed)
        GPIO.output(BIN2,True)#BIN2
        GPIO.output(BIN1,False) #BIN1
        time.sleep(t_time)
def startPush():
    global pushP, pushAd
    if pushAd == None:
        send2Client('adIsNone')
        return
    pushP = subprocess.Popen(['ffmpeg', '-thread_queue_size', '1024', '-f', 'video4linux2', '-s', '1280x720', '-i', "/dev/video0", '-vcodec', 'h264_omx', '-bf', '0', '-pix_fmt', 'yuv420p', '-r', '15', '-g', '25', '-b:v', '4M', '-bufsize', '10M', '-an', '-f', 'flv', pushAd])
    #print('pushP', pushP.communicate()[0], pushP.returncode)
    if pushP.returncode == None:
        print("success")
    else:
        print("error")
        send2Client('pushError')
        stopPush()
    # os.popen('sh /home/pi/CLBROBOT/ffmpeg.sh')
def stopPush():
    global pushP
    if pushP == None:
        return
    pushP.kill();
    os.popen('sh /home/pi/CLBROBOT/stopffmpeg.sh')
    pushP = None
    # os.killpg(pushP.pid,signal.SIGUSR1)
    # os.kill(pushP.pid, 0)
    # else:
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(Gpin, GPIO.OUT)     # 设置绿色Led引脚模式输出
GPIO.setup(Rpin, GPIO.OUT)     # 设置红色Led引脚模式输出
GPIO.setup(BtnPin, GPIO.IN, pull_up_down=GPIO.PUD_UP)    # 设置输入BtnPin模式，拉高至高电平(3.3V)
GPIO.setup(AIN2,GPIO.OUT)
GPIO.setup(AIN1,GPIO.OUT)
GPIO.setup(PWMA,GPIO.OUT)

GPIO.setup(BIN1,GPIO.OUT)
GPIO.setup(BIN2,GPIO.OUT)
GPIO.setup(PWMB,GPIO.OUT)

L_Motor= GPIO.PWM(PWMA,100)
L_Motor.start(0)

R_Motor = GPIO.PWM(PWMB,100)
R_Motor.start(0)

def main(status):
    print(status)
    if status == 'up':
        t_up(50,0)
        print('up')
    elif status == 'down':
        t_down(50,0)
    elif status == 'left':
        t_left(50,0)
    elif status == 'right':
        t_right(50,0)
    elif status == 'bleft':
        b_left()
    elif status == 'bright':
        b_right()
    elif status == 'btop':
        b_down()
    elif status == 'bdown':
        b_top()
    elif status == 'startpush':
        startPush()
    elif status == 'stoppush':
       stopPush()
    else:
        t_stop(0)

def send2Client(data):
    # for connter in ConnectManager.connectors:
        #ConnectManager.send_to_all(data)
    global ws
    if ws == None:
        return
    ws.send(data)

def linkPing():
    ws.send(json.dumps({"type":"ping"}))

class car_client (WebSocketClient):
    def opened(self):
        ws.send(json.dumps({'type':'carlogin', 'client_name': 'car', 'room_id': 1, 'from': 'room' }))
        sTimer = Timer(3, linkPing)
    def closed(self, code, reason=None):
        print('closed', code, reason)
        # startLink()
    def received_message(self, m):
        if m.is_text:
            m = m.data.decode("utf-8")
        if len(m.split('pushAddress:')) > 1:
            send2Client('pushSuccess')
            global pushAd
            pushAd = m.split('pushAddress:')[1]
        else:
            main(m)
@route('/test/example/1')
def example_1(request, data):
    print(data.split('pushAddress:'))
    if len(data.split('pushAddress:')) > 1:
        send2Client('pushSuccess')
        global pushAd
        pushAd = data.split('pushAddress:')[1]
    else:
        main(data)
    return data + ' - data from pywss'
def startWeb():
    ws = Pyws(__name__, address='10.0.2.1', port=8866)
    # ws.add_middleware(Radio)
    ws.serve_forever()
# startWeb()

def startLink():
    try:
        global ws
        ws = car_client('wss://aicar.treedom.cn/', protocols=['chat'])
        ws.connect()
        ws.run_forever()
    except KeyboardInterrupt:
        if ws == None:
            return
        ws.close()
    except :
        startLink();
startLink()