# 🚀 Career PathFinder Project Initial Setup

이 프로젝트는 **React** (Frontend)와 **Django** (Backend)를 기반으로 하며, **Gemini API**를 활용하여 AI 기반 커리어 로드맵 및 역량 진단 기능을 제공합니다.

---

## 📂 Project Structure
```text
/career-pathfinder
├── .gitignore
├── README.md
├── frontend/          # React App (Vite)
└── backend/           # Django App

```

---

## 1. Backend Setup (Django)

### 🐍 Environment & Install

```bash
# 프로젝트 루트에서 실행
mkdir backend
cd backend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 필수 패키지 설치
pip install django djangorestframework django-cors-headers google-generativeai python-dotenv
pip freeze > requirements.txt

```

### ⚙️ Django Project Create

```bash
django-admin startproject config .
python manage.py startapp api

```

### 📝 config/settings.py (주요 설정)

```python
INSTALLED_APPS = [
	...
	'rest_framework',
	'corsheaders',
	'api',
]

MIDDLEWARE = [
	'corsheaders.middleware.CorsMiddleware', # 최상단 배치
	...
]

CORS_ALLOWED_ORIGINS = [
	"http://localhost:5173", # React 기본 포트
]

```

### 🤖 AI Service Utility (backend/api/ai_utils.py)

```python
import os
import google.generativeai as genai
from django.conf import settings

def get_gemini_response(prompt):
	genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
	model = genai.GenerativeModel('gemini-1.5-flash')
	response = model.generate_content(prompt)
	return response.text

```

---

## 2. Frontend Setup (React)

### ⚛️ Vite Project Create

```bash
# 프로젝트 루트(backend 외부)에서 실행
npm create vite@latest frontend -- --template react
cd frontend

# 필수 패키지 설치
npm install
npm install axios react-router-dom lucide-react # API 통신 및 UI 아이콘

```

### 🌐 Axios Instance (frontend/src/api/axios.js)

```javascript
import axios from 'axios';

const instance = axios.create({
	baseURL: 'http://localhost:8000/api', // Django API 서버 주소
});

export default instance;

```

---

## 3. Environment Variables (.env)

프로젝트 루트 혹은 각 서버 폴더에 `.env` 파일을 생성하여 관리합니다. (**주의: .gitignore에 반드시 추가**)

```text
# backend/.env
DEBUG=True
SECRET_KEY=your_django_secret_key
GEMINI_API_KEY=your_google_gemini_api_key

```

---

## 4. Git Configuration (.gitignore)

프로젝트 루트에 생성하여 두 디렉터리의 불필요한 파일이 올라가지 않도록 합니다.

```text
# Python / Django
__pycache__/
*.py[cod]
venv/
db.sqlite3
.env

# Node / React
node_modules/
dist/
.eslintcache

```

---

## 5. Development Strategy

1. **AI 비용 관리**: Django에서 `Vector DB` 혹은 `Cache` 테이블을 연동하여 유저 데이터를 구조화한 뒤, 필요한 컨텍스트만 추출해 Gemini API로 전송합니다.
2. **캐싱**: 동일한 직무/스펙의 로드맵 요청 시 `Redis` 또는 Django 기본 `Cache`를 활용해 API 호출 없이 응답합니다.
3. **데이터 흐름**:
* `React` (사용자 입력)
* → `Django` (DB 데이터 인출 + 선별된 프롬프트 구성)
* → `Gemini API` (응답)
* → `Django` (결과 DB 저장 및 캐싱)
* → `React` (결과 시각화)



```
