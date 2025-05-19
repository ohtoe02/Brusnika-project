import { useEffect, useRef } from 'react'
import { Network } from 'vis-network/standalone/esm/vis-network'

// Пример: data = { nodes: [...], edges: [...] }
// options — любые параметры vis-network
function VisNetwork({ data, options, style = { width: '100%', height: '600px' } }) {
	const containerRef = useRef(null)
	const networkRef = useRef(null)

	useEffect(() => {
		if (!containerRef.current || !data) return
		if (!networkRef.current) {
			// Инициализация сети
			networkRef.current = new Network(containerRef.current, data, options)
		} else {
			// Динамическое обновление параметров
			networkRef.current.setOptions(options)
			// Для обновления данных используем setData
			if (data.nodes && data.edges) {
				networkRef.current.setData(data)
			}
		}
	}, [data, options])

	return <div ref={containerRef} style={style} />
}

export default VisNetwork 