export function StarterLogo({
  className,
  variant = 'small',
}: {
  className?: string
  variant?: 'small' | 'main'
}) {
  const src = variant === 'main' ? '/Starter_Main.png' : '/Starter_small.png'
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="The Starter"
      className={className}
    />
  )
}
