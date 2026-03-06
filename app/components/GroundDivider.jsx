import Image from 'next/image'

export default function GroundDivider() {
    return (
        <div id="content" className="relative z-100 md:scale-y-[0.5] translate-z-0 h-[10px] translate-y-1/2">

            <img src="/images/ground_divider.webp" alt="" 
            className="absolute top-0 left-0 w-full object-cover object-center -scale-100 grayscale-80 -translate-y-1/2 scale-x-102 scale-y-80" />
        </div>
    )
}