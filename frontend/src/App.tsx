import { ToastProvider } from './components/toast/ToastProvider'

import { AppRouter } from './router/AppRouter'

function App() {
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  )
}

export default App
