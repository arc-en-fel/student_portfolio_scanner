import QRCode from 'qrcode'

export type ErrorLevel = 'L' | 'M' | 'Q' | 'H'

/**
 * Generate QR code data URL (PNG)
 * @param url - URL to encode
 * @param errorLevel - Error correction level (L, M, Q, H)
 * @returns Data URL string with image/png prefix
 * @throws Error if QR code generation fails
 */
export async function generateQRData(url: string, errorLevel: ErrorLevel = 'H'): Promise<string> {
  if (!url) {
    throw new Error('URL is required')
  }

  try {
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: errorLevel,
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return dataUrl
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate QR code as canvas element (for qrcode.react)
 * @param url - URL to encode
 * @param errorLevel - Error correction level
 * @returns Canvas element with QR code
 * @throws Error if generation fails
 */
export async function generateQRCanvas(url: string, errorLevel: ErrorLevel = 'H'): Promise<HTMLCanvasElement> {
  if (!url) {
    throw new Error('URL is required')
  }

  try {
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, url, {
      errorCorrectionLevel: errorLevel,
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return canvas
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Download QR code as PNG from a QR code element
 * @param qrElement - React QR code element or canvas
 * @param fileName - Name for the downloaded file
 * @throws Error if extraction or download fails
 */
export function downloadQRPNG(qrElement: HTMLElement | HTMLCanvasElement, fileName: string = 'portfolio-qr.png'): void {
  try {
    let canvas: HTMLCanvasElement | null = null

    // If it's already a canvas, use it
    if (qrElement instanceof HTMLCanvasElement) {
      canvas = qrElement
    } else {
      // Otherwise, find the canvas inside the element
      canvas = qrElement.querySelector('canvas')
    }

    if (!canvas) {
      throw new Error('No canvas found in QR element')
    }

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create blob from canvas')
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png')
  } catch (error) {
    throw new Error(`Failed to download QR PNG: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Download QR code as SVG from a QR code element
 * @param qrElement - React QR code element
 * @param fileName - Name for the downloaded file
 * @throws Error if extraction or download fails
 */
export function downloadQRSVG(qrElement: HTMLElement, fileName: string = 'portfolio-qr.svg'): void {
  try {
    // Find SVG inside the element
    const svg = qrElement.querySelector('svg')

    if (!svg) {
      throw new Error('No SVG found in QR element')
    }

    // Serialize SVG to string
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svg)

    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName.endsWith('.svg') ? fileName : `${fileName}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    throw new Error(`Failed to download QR SVG: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Construct full portfolio URL from slug
 * @param slug - Portfolio slug (URL-safe identifier)
 * @param appUrl - Base application URL (e.g., https://studentfolio.com)
 * @returns Full public portfolio URL
 * @throws Error if slug or appUrl is invalid
 */
export function getQRUrl(slug: string, appUrl: string): string {
  if (!slug) {
    throw new Error('Slug is required')
  }

  if (!appUrl) {
    throw new Error('App URL is required')
  }

  // Ensure appUrl doesn't end with /
  const baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl

  // Ensure baseUrl starts with http:// or https://
  if (!baseUrl.match(/^https?:\/\//)) {
    throw new Error('App URL must start with http:// or https://')
  }

  return `${baseUrl}/portfolio/${slug}`
}

/**
 * Generate QR code as SVG string
 * @param url - URL to encode
 * @param errorLevel - Error correction level
 * @returns SVG string
 * @throws Error if generation fails
 */
export async function generateQRSVG(url: string, errorLevel: ErrorLevel = 'H'): Promise<string> {
  if (!url) {
    throw new Error('URL is required')
  }

  try {
    const svgString = await QRCode.toString(url, {
      errorCorrectionLevel: errorLevel,
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return svgString
  } catch (error) {
    throw new Error(`Failed to generate QR SVG: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
