import Layout from '@/layout'

const routes = [
  {
    path: '/',
    name: 'root',
    component: Layout,
    redirect: 'Demo',
    children: [
      {
        path: '',
        name: 'Index',
        component: () => import('@/views'),
        meta: {
          title: ''
        }
      }
    ]
  }
]

export default routes
