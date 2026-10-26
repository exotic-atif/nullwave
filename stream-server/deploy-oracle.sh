#!/bin/bash
# ==============================================================================
# NullWave Stream Server - Oracle Cloud Free Tier VM Setup Script
# Tuned for VMs with <1GB total RAM (~500MB free RAM)
# ==============================================================================

set -e

echo "=== [1/5] Checking and Configuring Swap File ==="
# Low-memory Oracle instances freeze or crash without swap when yt-dlp runs.
# Creating a 1.5GB swapfile ensures 100% stability.
if [ ! -f /swapfile ]; then
    echo "Creating 1.5GB swap file..."
    sudo fallocate -l 1.5G /swapfile 2>/dev/null || sudo dd if=/dev/zero of=/swapfile bs=1M count=1536
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    if ! grep -q "/swapfile" /etc/fstab; then
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    fi
    echo "Swap created and activated successfully!"
else
    echo "Swap file already exists."
fi

echo "=== [2/5] Installing System Dependencies (ffmpeg, python3-venv) ==="
sudo apt-get update -y
sudo apt-get install -y ffmpeg python3-pip python3-venv git curl

echo "=== [3/5] Setting up Virtual Environment and yt-dlp ==="
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

venv/bin/pip install --upgrade pip
venv/bin/pip install -r requirements.txt
# Ensure the latest yt-dlp is installed directly in the venv
venv/bin/pip install --upgrade yt-dlp

echo "=== [4/5] Opening Port 4000 in Linux Firewall ==="
# Oracle Linux / Ubuntu on Oracle Cloud blocks all ingress traffic by default via iptables
if command -v ufw >/dev/null 2>&1; then
    sudo ufw allow 4000/tcp || true
fi

# In Oracle Cloud, iptables REJECT rule is present at the end of INPUT chain.
# Insert ACCEPT rule near the top:
sudo iptables -I INPUT 6 -p tcp --dport 4000 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 1 -p tcp --dport 4000 -j ACCEPT
if command -v netfilter-persistent >/dev/null 2>&1; then
    sudo netfilter-persistent save 2>/dev/null || true
fi

echo "=== [5/5] Installing and Starting systemd Service ==="
CURRENT_USER=$(whoami)
sed -e "s|User=ubuntu|User=$CURRENT_USER|g" \
    -e "s|/home/ubuntu/NullWave/stream-server|$SCRIPT_DIR|g" \
    nullwave-stream.service | sudo tee /etc/systemd/system/nullwave-stream.service > /dev/null

sudo systemctl daemon-reload
sudo systemctl enable nullwave-stream
sudo systemctl restart nullwave-stream

echo "=============================================================================="
echo " NullWave Stream Server is now running as a background service!"
echo " Status check: sudo systemctl status nullwave-stream"
echo " Live logs:    journalctl -u nullwave-stream -f"
echo " Test URL:     http://localhost:4000/health"
echo "=============================================================================="
