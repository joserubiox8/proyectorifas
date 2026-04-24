'use client'

import { useState } from 'react'
import { toPng } from 'html-to-image'

export default function DownloadButton({ targetId, fileName = 'comprobante.png' }: { targetId: string, fileName?: string }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    const element = document.getElementById(targetId)
    if (!element) return

    setDownloading(true)
    try {
      // Add a slight delay to ensure fonts/styles are fully rendered if needed
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      })
      const link = document.createElement('a')
      link.download = fileName
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Error downloading image:', error)
      alert('Hubo un error al intentar descargar la imagen.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
      </svg>
      {downloading ? 'Generando...' : 'Descargar Imagen'}
    </button>
  )
}
