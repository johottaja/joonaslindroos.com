export default function GroundDivider() {
    return (
    <div className="h-24 bg-neutral-900 relative z-100">
        <img src="/images/ground_divider.png" 
        className="absolute bottom-0 left-0 w-full object-cover object-center grayscale-70 scale-y-[0.8]" />
        <img src="/images/ground_divider.png" 
        className="absolute -top-13 left-0 w-full object-cover object-center scale-y-[-0.5] scale-x-[-1] grayscale-100" />
    </div>
    )
}