import { useEffect, useRef, useState } from 'react'
import './MiniMap.css'

export const MiniMap = ({ path }) => {
	const [rows, setRows] = useState([])
	const pathRef = useRef(null)

	useEffect(() => {
		if (!path) return

		const nodesPerRow = Math.floor(800 / 150) // Примерная ширина узла с отступами
		const rowsCount = Math.ceil(path.length / nodesPerRow)

		const newRows = []
		for (let i = 0; i < rowsCount; i++) {
			newRows.push(path.slice(i * nodesPerRow, (i + 1) * nodesPerRow))
		}
		setRows(newRows)
	}, [path])

	const currentNode = path?.[path.length - 1]?.data?.name || ''

	return (
		<div className='mini-map-container'>
			<div className='mini-map-title'>Путь до узла: {currentNode}</div>
			<div className='mini-map-path' ref={pathRef}>
				{rows.map((row, rowIndex) => (
					<div key={rowIndex} className='mini-map-row'>
						{row.map((node, index) => (
							<>
								<div key={node.data.id} className='mini-map-node'>
									{node.data.name}
								</div>
								{index < row.length - 1 && (
									<div className='mini-map-connector' />
								)}
							</>
						))}
					</div>
				))}
			</div>
		</div>
	)
}
