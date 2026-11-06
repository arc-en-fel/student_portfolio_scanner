import { FC } from 'react'
import { Profile, TemplateType } from '../../types'
import { MinimalTemplate } from './MinimalTemplate'
import { ModernTemplate } from './ModernTemplate'
import { CreativeTemplate } from './CreativeTemplate'

interface PortfolioRendererProps {
  profile: Profile
  templateName?: TemplateType
  accentColor?: string
  theme?: 'dark' | 'light'
}

export const PortfolioRenderer: FC<PortfolioRendererProps> = ({
  profile,
  templateName = TemplateType.MINIMAL_PROFESSIONAL,
  accentColor = '#4FD1C5',
  theme = 'dark',
}) => {
  const selectTemplate = (): React.ReactNode => {
    switch (templateName) {
      case TemplateType.MODERN_DEVELOPER:
        return <ModernTemplate profile={profile} accentColor={accentColor} />
      case TemplateType.CREATIVE_PORTFOLIO:
        return <CreativeTemplate profile={profile} accentColor={accentColor} />
      case TemplateType.MINIMAL_PROFESSIONAL:
      default:
        return <MinimalTemplate profile={profile} accentColor={accentColor} />
    }
  }

  return (
    <div
      className={theme === 'dark' ? 'dark' : 'light'}
      style={{
        '--accent-color': accentColor,
      } as React.CSSProperties}
    >
      {selectTemplate()}
    </div>
  )
}
