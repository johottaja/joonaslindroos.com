export default function GroundDivider() {
    return (
    <div className="bg-neutral-900 relative z-100 scale-y-[0.5]">
        <img src="/images/ground_divider.png" 
        className="absolute bottom-0 left-0 w-full object-cover object-center grayscale-70" />
        <img src="/images/ground_divider.png" 
        className="absolute top-0 left-0 w-full object-cover object-center -scale-100 grayscale-70" />
    </div>
    )
}