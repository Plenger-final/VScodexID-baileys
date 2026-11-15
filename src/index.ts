import makeWASocket from './Socket/vscodex-pro'

export * from '../WAProto/index.js'
export * from './Utils/index'
export * from './Types/index'
export * from './Defaults/index'
export * from './WABinary/index'
export * from './WAM/index'
export * from './WAUSync/index'
export * from './Features/anti-ban'
export * from './Features/buttons'
export * from './Features/media-helpers'
export * from './Features/carousel'
export * from './Features/album'
export * from './Features/sticker-exif'
export * from './Features/anti-delete'
export * from './Features/auto-join'
export * from './Features/lid-to-jid'
export * from './Features/custom-pairing'

export type WASocket = ReturnType<typeof makeWASocket>
export { makeWASocket }
export default makeWASocket
