export default function ProjectsSection() {
    return (
        <section className="w-screen h-[300lvh] relative">

            <div className="absolute top-0 left-0 w-full h-screen z-10">
                <img src="/images/sysiphus_projects/man.png" className="inset-0 w-screen h-screen object-cover -z-10" />
            </div>
            <div className="absolute top-0 left-0 w-full h-screen -z-10">
                <img src="/images/sysiphus_projects/background_filled.png" className="inset-0 w-screen h-screen object-cover -z-10" />
            </div>
        </section>
    )
}