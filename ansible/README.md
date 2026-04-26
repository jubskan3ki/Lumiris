# LUMIRIS — Ansible

Three playbooks, one VPS lifecycle:

| Playbook             | When to run                                          |
| -------------------- | ---------------------------------------------------- |
| `bootstrap.yml`      | First time a host joins (Docker + UFW + fail2ban).   |
| `deploy.yml`         | On every release tag (`make deploy-zd IMAGE_TAG=…`). |
| `rotate-secrets.yml` | Quarterly, or on any suspected leak (sops + age).    |

## Quickstart

```bash
# 1. Edit your real inventory (this repo ships only an example).
cp ansible/inventories/production.example.yml ansible/inventories/production.yml

# 2. Bootstrap a fresh host.
ansible-playbook -i ansible/inventories/production.yml ansible/bootstrap.yml

# 3. Deploy a tagged release.
ansible-playbook -i ansible/inventories/production.yml ansible/deploy.yml \
  -e image_tag=$(git rev-parse --short HEAD)

# 4. Rotate secrets (after editing the encrypted vault).
ansible-playbook -i ansible/inventories/production.yml ansible/rotate-secrets.yml
```

## Secrets

Encrypted at rest with [sops](https://github.com/getsops/sops) + age. The age
public key is committed in `ansible/.sops.yaml`; private keys live on the
operator's hardware key — **never** in this repo.
