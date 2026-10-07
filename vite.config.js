import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true, // 외부 터널(Cloudflare Tunnel 등) 접속 완벽 허용
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    },
    watch: {
      ignored: ['**/*.log', '**/cloudflared.exe', '**/.tools/**']
    }
  }
});
