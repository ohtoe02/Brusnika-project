import { useState } from 'react'

const TreeSettings = ({ onSettingsChange }) => {
	const [settings, setSettings] = useState({
		nodeSize: 20,
		nodeSpacing: 100,
		levelHeight: 150,
		showDetails: true,
		highlightParents: true,
		animationDuration: 500,
	})

	const handleChange = (key, value) => {
		const newSettings = { ...settings, [key]: value }
		setSettings(newSettings)
		onSettingsChange(newSettings)
	}

	return (
		<div className='tree-settings'>
			<div className='setting-group'>
				<label>
					Размер узла:
					<input
						type='range'
						min='10'
						max='50'
						value={settings.nodeSize}
						onChange={e => handleChange('nodeSize', parseInt(e.target.value))}
					/>
					<span>{settings.nodeSize}px</span>
				</label>
			</div>
			<div className='setting-group'>
				<label>
					Расстояние между узлами:
					<input
						type='range'
						min='50'
						max='200'
						value={settings.nodeSpacing}
						onChange={e =>
							handleChange('nodeSpacing', parseInt(e.target.value))
						}
					/>
					<span>{settings.nodeSpacing}px</span>
				</label>
			</div>
			<div className='setting-group'>
				<label>
					Высота уровня:
					<input
						type='range'
						min='100'
						max='300'
						value={settings.levelHeight}
						onChange={e =>
							handleChange('levelHeight', parseInt(e.target.value))
						}
					/>
					<span>{settings.levelHeight}px</span>
				</label>
			</div>
			<div className='setting-group'>
				<label>
					<input
						type='checkbox'
						checked={settings.showDetails}
						onChange={e => handleChange('showDetails', e.target.checked)}
					/>
					Показывать детали
				</label>
			</div>
			<div className='setting-group'>
				<label>
					<input
						type='checkbox'
						checked={settings.highlightParents}
						onChange={e => handleChange('highlightParents', e.target.checked)}
					/>
					Подсвечивать родителей
				</label>
			</div>
			<div className='setting-group'>
				<label>
					Длительность анимации:
					<input
						type='range'
						min='100'
						max='1000'
						step='100'
						value={settings.animationDuration}
						onChange={e =>
							handleChange('animationDuration', parseInt(e.target.value))
						}
					/>
					<span>{settings.animationDuration}ms</span>
				</label>
			</div>
		</div>
	)
}

export default TreeSettings
