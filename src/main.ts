import { createApp } from 'vue'
import { 
  setTheme,
  Button, ButtonDefinition,
  Badge, BadgeDefinition,
  Switch, SwitchDefinition,
  Slider, SliderDefinition,
  Divider, DividerDefinition,
  Spinner, SpinnerDefinition,
  ProgressBar, ProgressBarDefinition,
  Dropdown, DropdownDefinition,
  DropdownOption, DropdownOptionDefinition,
  TextInput, TextInputDefinition,
  MessageBar, MessageBarDefinition,
  Text, TextDefinition,
} from '@fluentui/web-components'
import { webLightTheme } from '@fluentui/tokens'
import './style.css'
import App from './App.vue'

Button.define(ButtonDefinition)
Badge.define(BadgeDefinition)
Switch.define(SwitchDefinition)
Slider.define(SliderDefinition)
Divider.define(DividerDefinition)
Spinner.define(SpinnerDefinition)
ProgressBar.define(ProgressBarDefinition)
Dropdown.define(DropdownDefinition)
DropdownOption.define(DropdownOptionDefinition)
TextInput.define(TextInputDefinition)
MessageBar.define(MessageBarDefinition)
Text.define(TextDefinition)

setTheme(webLightTheme)

createApp(App).mount('#app')
