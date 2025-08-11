# Проект: Обучение разработке  

## Структура  
- `backend_dev.md` — гайд по бэкенду (БД, API, авторизация).  
- `frontend_dev.md` — гайд по фронтенду (компоненты, запросы).  
- `learning/` — примеры кода для тренировки.  

## Как использовать  
1. Копируйте код из файлов в свой проект.  
2. Для обучения — редактируйте файлы в `learning/`.  
```

---

### 2. **Гайд для бэкенд-разработчика** (`backend_dev.md`)  
```markdown backend_dev.md
# Бэкенд: Шпаргалка  

## 1. Подключение к PostgreSQL  
```python
# main.py  
from sqlalchemy import create_engine  

engine = create_engine("postgresql://user:password@localhost/db_name")  

# Пример запроса  
with engine.connect() as conn:  
    result = conn.execute("SELECT * FROM users;")  
    print(result.fetchall())  
```  

## 2. JWT-авторизация (FastAPI)  
```python
# auth.py  
from fastapi import Depends, HTTPException, status  
from fastapi.security import OAuth2PasswordBearer  

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")  

def get_current_user(token: str = Depends(oauth2_scheme)):  
    # Проверка токена  
    if token != "valid_token":  
        raise HTTPException(status_code=401, detail="Invalid token")  
    return {"user_id": 1}  
```  
*(Добавьте больше примеров по запросу!)*  
```

---

### 3. **Гайд для фронтенд-разработчика** (`frontend_dev.md`)  
```markdown frontend_dev.md
# Фронтенд: Шпаргалка  

## 1. Компонент на React  
```jsx
// App.js  
import React, { useState } from 'react';  

function App() {  
  const [data, setData] = useState(null);  

  const fetchData = async () => {  
    const response = await fetch("/api/data");  
    setData(await response.json());  
  };  

  return <button onClick={fetchData}>Загрузить данные</button>;  
}  
```  

## 2. Запросы к API (Axios)  
```javascript
// api.js  
import axios from 'axios';  

axios.get("/api/users")  
  .then(response => console.log(response.data))  
  .catch(error => console.error(error));  
```  
*(Ещё примеры? Уточните технологии!)*  
```

---

### 4. **Обучающие файлы** (`learning/`)  
- `db_learning.md` — SQL-тренировка:  
  ```markdown learning/db_learning.md
  ```sql
  -- Создание таблицы  
  CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(50));  

  -- Вставка данных  
  INSERT INTO users (name) VALUES ('Test User');  
  ```  