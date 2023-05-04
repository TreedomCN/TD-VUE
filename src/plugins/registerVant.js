import {
  Field,
  Cell,
  CellGroup,
  Button,
  Icon,
  Tabbar,
  TabbarItem,
  Image as VanImage,
  Popup
} from 'vant'

const componentList = [
  Field,
  Cell,
  CellGroup,
  Button,
  Icon,
  Tabbar,
  TabbarItem,
  VanImage,
  Popup
]

export function registerVantComp(app) {
  componentList.forEach((comp) => {
    app.use(comp)
  })
}

