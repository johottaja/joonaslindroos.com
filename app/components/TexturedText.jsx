'use client'

export default function TexturedText({ 
    children, 
    className = '', 
    brightness = 300,
    contrast = 70,
    style = {},
    innerRef
}) {
    return (
        <p
            ref={innerRef}
            className={className}
            style={{
                willChange: 'transform, filter',
                backgroundImage: 'url(/images/texture.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center bottom',
                backgroundRepeat: 'no-repeat',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: `grayscale(100%) brightness(${brightness}%) contrast(${contrast}%)`,
                ...style
            }}
        >
            {children}
        </p>
    )
}
