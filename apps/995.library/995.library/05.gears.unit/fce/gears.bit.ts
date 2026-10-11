export default interface GearsBit {
    idx: string
    src?: string
    val?: number
    dat?: any
    slv?: (result: { grsBit: Partial<GearsBit> }) => void
}
