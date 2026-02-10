# IT 工单系统

[English](./README.md) | [Français](./README.fr.md) | [Nederlands](./README.nl.md) | [中文](./README.zh-CN.md)

一个用于企业内部 IT 支持场景的工单平台，技术栈为 **Django + DRF + Celery + PostgreSQL + Redis + React + MUI**。

## 功能

- 工单全流程：创建、分配、解决、关闭。
- 员工管理（增删改查）。
- 知识库管理，支持异步向量生成。
- 新工单自动触发 AI 分析。
- 前端多语言（`zh`、`en`、`fr`、`nl`）。
- 监控：Prometheus + Grafana + exporters。

## 快速启动（Docker Compose）

```bash
docker compose up --build -d
```

访问地址：

- 前端：<http://localhost>
- 后端 API：<http://localhost:8000/api/>
- 管理后台：<http://localhost:8000/admin/>
- Prometheus：<http://localhost:9090>
- Grafana：<http://localhost:3001>（`admin/admin123`）

停止：

```bash
docker compose down
```

## 本地开发

### 后端

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Celery：

```bash
cd backend
celery -A config worker --loglevel=info --pool=solo
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

## 如何同步到 GitHub

```bash
git remote add origin git@github.com:yaowubarbara/it-ticketing-system.git
# 或 https 方式
# git remote add origin https://github.com/yaowubarbara/it-ticketing-system.git

git push -u origin work
```

如果要发到 `main`：

```bash
git checkout main
git merge work
git push origin main
```
