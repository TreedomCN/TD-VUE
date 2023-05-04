importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js');
// console.log(tf);
let modelNow;
const weights = '../cocacola_web_model/model.json';
(async () => {
    await tf.loadGraphModel(weights).then(model => {
            modelNow = model;
            // console.log(modelNow);
            const back = tf.getBackend();
            postMessage({action: 'inited', data: back})
            // console.log('sss')
        });
})()
onmessage = function (e) {
    console.log('Worker:Message received from main script');
    const {action, data } = e.data;
    switch (action) {
        case 'imageData':
            console.log(data);
                let [modelWidth, modelHeight] = modelNow.inputs[0].shape.slice(1, 3);
                const input = tf.tidy(() => {
                return tf.image.resizeBilinear(tf.browser.fromPixels(data.imageData), [modelWidth, modelHeight])
                    .div(255.0).expandDims(0);
                    // return tf.expandDims(tf.browser.fromPixels(videoDom),0);
                });
                // tf.zeros([1, modelWidth, modelHeight, 3]);
                // input.print();
                // worker.postMessage({msg: 'start', input: input})
                // console.log(input);
                modelNow.executeAsync(input).then(res => {
                // const t = new Date().getTime();
                // Font options.
                    // const font = "16px sans-serif";
                    // ctx.font = font;
                    // ctx.textBaseline = "top";
                    // console.log(res);
                    const [boxes, scores, classes, valid_detections] = res;
                    const boxes_data = boxes.dataSync();
                    const scores_data = scores.dataSync();
                    const classes_data = classes.dataSync();
                    const valid_detections_data = valid_detections.dataSync()[0];
                    // requestAnimationFrame(() => {
                        postMessage({action:'segements', data:{boxes_data, scores_data, classes_data, valid_detections_data}});
                        tf.dispose(res)
                        input.dispose();
                    // }); 
                    console.log(valid_detections_data)
                });
            break;
        case 'init':
            console.log(data);
            break;
        default:
            break;
    }
}