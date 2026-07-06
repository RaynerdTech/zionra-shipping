import type { CSSProperties } from 'react'

type HeroVisualProps = {
  ambientOnly?: boolean
}

const colors = {
  blue: '#286BDC',
  blueLight: '#61A0FF',
  blueSoft: '#153D7B',
  teal: '#2EC4B6',
  orange: '#FFA630',
  green: '#2EC4B6',
  white: '#FFFFFF',
  surface: '#102A56',
  muted: '#8FA3C5',
  progress: '#5B9BFF',
  progressBg: '#1E4788',
  progressDot: '#234D91',
  progressRing: '#9CC4FF',
} as const

function HeroVisual({ ambientOnly = false }: HeroVisualProps) {
  const cx = 310
  const cy = 287

  return (
    <div className="relative h-[657px] w-[650px] overflow-visible font-sans">
      <div
  className="pointer-events-none absolute inset-0 hidden lg:block"
  style={{
    backgroundImage:
      'linear-gradient(to right, rgba(40,107,220,0.045) 1px, transparent 1px)',
    backgroundSize: '76px 100%',
    backgroundPosition: '18px 0',
  }}
/>

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 650 657"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Orbit rings */}
        <circle cx={cx} cy={cy} r="315" stroke={colors.blue} strokeOpacity="0.07" />
        <circle cx={cx} cy={cy} r="248" stroke={colors.blue} strokeOpacity="0.085" />
        <circle cx={cx} cy={cy} r="184" stroke={colors.blue} strokeOpacity="0.1" />
        <circle cx={cx} cy={cy} r="126" stroke={colors.blue} strokeOpacity="0.13" />
        <circle cx={cx} cy={cy} r="72" stroke={colors.blue} strokeOpacity="0.16" />

        {/* Center to top cards */}
        <line
          x1={cx}
          y1={cy}
          x2="188"
          y2="202"
          stroke={colors.blue}
          strokeOpacity="0.16"
        />
        <line
          x1={cx}
          y1={cy}
          x2="460"
          y2="179"
          stroke={colors.blue}
          strokeOpacity="0.16"
        />

        {/* Port Harcourt to Glasgow middle connector */}
        <path
          d="M156 304L310 313"
          stroke={colors.blue}
          strokeOpacity="0.25"
        />
        <path
          d="M310 313L496 304"
          stroke={colors.blue}
          strokeOpacity="0.25"
        />

        {/* Center to bottom cards */}
        <line
          x1={cx}
          y1={cy}
          x2="109"
          y2="418"
          stroke={colors.blue}
          strokeOpacity="0.15"
        />
        <line
          x1={cx}
          y1={cy}
          x2="452"
          y2="471"
          stroke={colors.blue}
          strokeOpacity="0.15"
        />
      </svg>

      {/* Center glow */}
      <div
        className="absolute h-[146px] w-[146px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zion-blue/[0.035]"
        style={{ left: cx, top: cy }}
      />
      <div
        className="absolute h-[112px] w-[112px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zion-blue/[0.075]"
        style={{ left: cx, top: cy }}
      />
      <div
        className="absolute h-[86px] w-[86px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zion-blue/10"
        style={{ left: cx, top: cy }}
      />
      <div
        className="absolute h-[70px] w-[70px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-zion-blue bg-zion-blue-soft"
        style={{ left: cx, top: cy }}
      />
      <div
        className="absolute flex h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-zion-blue font-display text-[26px] font-bold leading-none text-zion-white shadow-[0_0_28px_rgba(40,107,220,0.42)]"
        style={{ left: cx, top: cy }}
      >
        Z
        <span className="absolute right-[3px] top-[10px] h-[12px] w-[12px] rounded-full bg-zion-orange" />
      </div>

      {/* Route dots */}
      <SmallPoint className="left-[222px] top-[222px]" color={colors.blue} />
      <SmallPoint className="left-[391px] top-[211px]" color={colors.orange} orange />
      <SmallPoint className="left-[396px] top-[402px]" color={colors.teal} />

      {!ambientOnly && (
        <>
          <InfoCard
            className="left-[104px] top-[110px]"
            accent={colors.blue}
            color={colors.blue}
            title="Lagos"
            subtitle="Received"
            status="Active"
            width="w-[101px]"
          />

          <InfoCard
            className="left-[440px] top-[86px]"
            accent={colors.orange}
            color={colors.orange}
            title="London"
            subtitle="Origin"
            status="Active"
            orange
            width="w-[110px]"
          />

          <InfoCard
            className="left-[56px] top-[254px]"
            accent={colors.teal}
            color={colors.teal}
            title="Port"
            subtitle="Harcourt"
            status="Active"
            width="w-[100px]"
          />

          <InfoCard
            className="left-[496px] top-[244px]"
            accent={colors.teal}
            color={colors.teal}
            title="Glasgow"
            subtitle="Origin"
            status="Active"
            width="w-[113px]"
            largeDot
          />

          <InfoCard
            className="left-[109px] top-[417px]"
            accent={colors.blue}
            color={colors.blue}
            title="Abuja"
            subtitle="Received"
            status="Active"
            width="w-[100px]"
          />

          <InfoCard
            className="left-[432px] top-[422px]"
            accent={colors.blue}
            color={colors.blue}
            title="Abuja"
            subtitle="Received"
            status="Active"
            width="w-[100px]"
          />

          <div className="absolute left-[49px] top-[530px] h-[86px] w-[518px] rounded-[10px] border border-zion-blue/55 bg-zion-surface shadow-[0_14px_28px_rgba(0,0,0,0.24)]">
            <div className="absolute left-0 top-0 h-[4px] w-full rounded-t-[10px] bg-zion-blue" />

            <div className="px-[16px] pt-[16px]">
              <div className="flex items-start gap-[10px]">
                <span className="mt-[-1px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-zion-green/20">
                  <span className="block h-[8px] w-[8px] rounded-full bg-zion-green" />
                </span>

                <div>
                  <p className="text-[14px] font-light leading-none tracking-[-0.01em] text-zion-white font-display">
                    Live ZNR-20480
                  </p>

                  <p className="mt-[10px] text-[13px] leading-none text-zion-muted-2">
                    Manchester → Lagos
                    <span className="px-[7px]">·</span>
                    In transit
                    <span className="px-[7px]">·</span>
                    Est. 3 days
                  </p>
                </div>
              </div>

              <div className="mt-[10px] flex items-center justify-between">
                <div className="relative h-[16px] w-[382px]">
                  <div className="absolute left-0 right-0 top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-zion-progress-bg" />
                  <div className="absolute left-0 top-1/2 h-[6px] w-[226px] -translate-y-1/2 rounded-full bg-zion-progress" />

                  <ProgressDot active style={{ left: '0px' }} />
                  <ProgressDot active style={{ left: '77px' }} />
                  <ProgressDot active style={{ left: '154px' }} />
                  <ProgressDot style={{ left: '231px' }} />
                  <ProgressDot style={{ left: '308px' }} />
                </div>

                <p className="pb-[1px] text-[14px] font-semibold leading-none text-zion-orange">
                  ETA 3 days
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

type InfoCardProps = {
  className?: string
  accent: string
  color: string
  title: string
  subtitle: string
  status: string
  orange?: boolean
  largeDot?: boolean
  width: string
}

function InfoCard({
  className = '',
  accent,
  color,
  title,
  subtitle,
  status,
  orange = false,
  largeDot = false,
  width,
}: InfoCardProps) {
  return (
    <div
      className={`absolute ${width} h-[86px] rounded-[10px] border bg-zion-surface  ${className}`}
      style={{ borderColor: accent }}
    >
      <div
        className="absolute left-0 top-0 h-[4px] w-full rounded-t-[10px]"
        style={{ backgroundColor: accent }}
      />

      <div className="absolute left-[12px] top-[20px] flex items-start gap-[8px]">
        <NodeIcon color={color} orange={orange} large={largeDot} />

        <div className="min-w-0">
          <p className="whitespace-nowrap text-[14px] font-semibold leading-[1.05] text-zion-white font-sans">
            {title}
          </p>
          <p className="mt-[4px] whitespace-nowrap text-[12px] leading-none text-zion-muted-2">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="absolute bottom-[11px] left-[13px] flex items-center gap-[8px]">
        <span
          className="h-[9px] w-[9px] rounded-full"
          style={{ backgroundColor: color }}
        />
        <p className="text-[12px] leading-none" style={{ color }}>
          {status}
        </p>
      </div>
    </div>
  )
}

function NodeIcon({
  color,
  orange = false,
  large = false,
}: {
  color: string
  orange?: boolean
  large?: boolean
}) {
  if (large) {
    return (
      <span
        className="block h-[30px] w-[30px] shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
    )
  }

  const size = orange ? 28 : 24
  const fillOpacity = orange ? 0.14 : 0.2
  const inner = orange ? 12 : 12

  return (
    <span
      className="relative block shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2}
          fill={color}
          fillOpacity={fillOpacity}
        />
      </svg>

      <span
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: inner,
          height: inner,
          backgroundColor: color,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </span>
  )
}

function SmallPoint({
  className,
  color,
  orange = false,
}: {
  className: string
  color: string
  orange?: boolean
}) {
  const size = orange ? 20 : 22
  const inner = orange ? 10 : 10
  const opacity = orange ? 0.14 : 0.2

  return (
    <span
      className={`absolute ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: color,
          opacity,
        }}
      />
      <span
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: inner,
          height: inner,
          backgroundColor: color,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </span>
  )
}

function ProgressDot({
  active = false,
  style,
}: {
  active?: boolean
  style?: CSSProperties
}) {
  return (
    <span
      className={`absolute top-1/2 h-[16px] w-[16px] -translate-x-1/2 -translate-y-1/2 rounded-full ${
        active
          ? 'border-[4px] border-zion-blue bg-zion-white/90'
          : 'bg-zion-progress-dot'
      }`}
      style={style}
    />
  )
}

export default HeroVisual