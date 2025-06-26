import { Routes, Route } from 'react-router-dom'
import AdminPanelEnhanced from './components/AdminPanelEnhanced'
import MainApp from './components/MainApp'

function App() {
	return (
		<Routes>
			<Route path="/admin/*" element={<AdminPanelEnhanced />} />
			<Route path="/*" element={<MainApp />} />
		</Routes>
	)
}

export default App
