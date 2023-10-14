import { getDefaultConfig } from 'connectkit'
import { createConfig } from 'wagmi'

const walletConnectProjectId = '32a632ba4a54d822c5ee73748c97fe27'

export const config = createConfig(
  getDefaultConfig({
    autoConnect: true,
    appName: 'My wagmi + ConnectKit App',
    walletConnectProjectId,
    alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
  })
)
