module.exports = {
  apps: [
    {
      name: 'kabulig',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/kabulig',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/kabulig/error.log',
      out_file: '/var/log/kabulig/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
}
