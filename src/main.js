import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { 
  Button, 
  Tab, 
  Tabs, 
  Icon, 
  Divider, 
  NavBar, 
  Skeleton, 
  Tag, 
  Circle, 
  Collapse, 
  CollapseItem, 
  Rate, 
  Image as VanImage, 
  Swipe, 
  SwipeItem, 
  ActionBar, 
  ActionBarIcon, 
  ActionBarButton, 
  Dialog, 
  Field,
  Form,
  CellGroup,
  Cell,
  Tabbar,
  TabbarItem,
  Toast,
  Loading,
  Empty,
  PullRefresh,
  List,
  Search,
  DropdownMenu,
  DropdownItem
} from 'vant'
import 'vant/lib/index.css'

// 创建应用实例
const app = createApp(App)

// 使用路由和状态管理
app.use(router)
app.use(createPinia())

// 注册Vant组件
app.use(Button)
app.use(Tab)
app.use(Tabs)
app.use(Icon)
app.use(Divider)
app.use(NavBar)
app.use(Skeleton)
app.use(Tag)
app.use(Circle)
app.use(Collapse)
app.use(CollapseItem)
app.use(Rate)
app.use(VanImage)
app.use(Swipe)
app.use(SwipeItem)
app.use(ActionBar)
app.use(ActionBarIcon)
app.use(ActionBarButton)
app.use(Dialog)
app.use(Field)
app.use(Form)
app.use(CellGroup)
app.use(Cell)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Toast)
app.use(Loading)
app.use(Empty)
app.use(PullRefresh)
app.use(List)
app.use(Search)
app.use(DropdownMenu)
app.use(DropdownItem)

// 挂载应用
app.mount('#app') 