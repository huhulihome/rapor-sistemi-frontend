# ⚡ Hızlı Düzeltme Görevleri

**Durum:** Sorunlar tespit edildi, çözümler hazır  
**Tahmini Süre:** 1 saat

---

## 🎯 ÖNCELİK SIRASI

### 🔴 1. RECURRING TASKS DÜZELTMESİ (30 dk)

**Sorun:** Rutin görevler tamamlandığında yeni görev oluşmuyor

**Çözüm Adımları:**

#### A. Supabase Migration Kontrolü (5 dk)
1. Supabase Dashboard > SQL Editor aç
2. `SUPABASE_MIGRATION_KONTROL.sql` dosyasını aç
3. İlk 3 sorguyu çalıştır (kolon, trigger, function kontrolü)
4. Eğer sonuç dönmezse:
   - `supabase/migrations/005_recurring_tasks.sql` dosyasını aç
   - İçeriği kopyala ve SQL Editor'de çalıştır
   - `supabase/migrations/008_fix_recurring_task_trigger.sql` dosyasını çalıştır

#### B. Backend Recurring Fields Kontrolü (10 dk)
**Dosya:** `backend/src/routes/tasks.ts`

**Kontrol Edilecekler:**
- POST `/api/tasks` endpoint'inde recurring fields kaydediliyor mu?
- PUT `/api/tasks/:id` endpoint'inde recurring fields güncelleniyor mu?

**Düzeltme:** (Eğer gerekirse)
```typescript
// POST /api/tasks
const taskData = {
  ...existingFields,
  is_recurring: req.body.is_recurring || false,
  recurrence_pattern: req.body.recurrence_pattern,
  recurrence_interval: req.body.recurrence_interval || 1,
  recurrence_end_date: req.body.recurrence_end_date,
  task_type: req.body.task_type || 'one_time',
};
```

#### C. Frontend Form Kontrolü (10 dk)
**Dosya:** `frontend/src/components/tasks/TaskForm.tsx`

**Kontrol Edilecekler:**
- Recurring fields form'da var mı? ✅ (Zaten var)
- Submit'te API'ye gönderiliyor mu?

#### D. Test (5 dk)
1. Yeni rutin görev oluştur
2. Tamamla
3. Yeni görev oluştu mu kontrol et

---

### 🟡 2. TO-DO LIST ADMIN VIEW DÜZELTMESİ (30 dk)

**Sorun:** Admin kendi to-do listesinde tüm kullanıcıların to-do'larını görüyor

**Çözüm:** Frontend'de tab sistemi ekle

#### A. PersonalTodoList Component Güncelleme (25 dk)

**Dosya:** `frontend/src/components/dashboard/PersonalTodoList.tsx`

**Değişiklikler:**

1. **State Ekle:**
```typescript
const [viewMode, setViewMode] = useState<'personal' | 'all'>('personal');
const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
const [users, setUsers] = useState<Array<{id: string, full_name: string}>>([]);
```

2. **Fetch Todos Güncelle:**
```typescript
const fetchTodos = async () => {
  try {
    setLoading(true);
    const headers = await getAuthHeaders();
    
    let url = `${apiUrl}/api/todos?limit=100`;
    
    // Admin ve viewMode'a göre filtrele
    if (isAdmin && viewMode === 'personal') {
      // Admin kendi to-do'larını görsün
      url += `&user_id=${user?.id}`;
    }
    // viewMode === 'all' ise backend zaten tüm to-do'ları döner (admin için)
    
    if (!showCompleted) {
      url += '&is_completed=false';
    }
    
    const response = await fetch(url, { headers });
    const result = await response.json();
    
    if (result.data) {
      setTodos(result.data);
    }
  } catch (error) {
    console.error('Error fetching todos:', error);
  } finally {
    setLoading(false);
  }
};
```

3. **UI'ye Tab Sistemi Ekle:**
```tsx
{isAdmin && (
  <div className="flex gap-2 mb-4">
    <button
      onClick={() => setViewMode('personal')}
      className={`px-4 py-2 rounded-lg ${
        viewMode === 'personal'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700'
      }`}
    >
      Kendi To-Do'larım
    </button>
    <button
      onClick={() => setViewMode('all')}
      className={`px-4 py-2 rounded-lg ${
        viewMode === 'all'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700'
      }`}
    >
      Tüm Kullanıcılar
    </button>
  </div>
)}
```

4. **To-Do Listesinde Kullanıcı Adı Göster (Admin All View):**
```tsx
{viewMode === 'all' && todo.user && (
  <span className="text-xs text-gray-500">
    👤 {todo.user.full_name}
  </span>
)}
```

#### B. Backend Endpoint Güncelleme (5 dk)

**Dosya:** `backend/src/routes/todos.ts`

**Kontrol:** Admin için user_id filtresi ekle

```typescript
// GET /api/todos
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { is_completed, limit = '50', user_id } = req.query;
    
    let query = supabase
      .from('todos')
      .select('*, user:profiles!todos_user_id_fkey(id, full_name, email)')
      .order('created_at', { ascending: false });
    
    // Eğer user_id parametresi varsa ve admin ise, o kullanıcının to-do'larını getir
    if (user_id && req.user?.role === 'admin') {
      query = query.eq('user_id', user_id);
    }
    // Admin değilse veya user_id yoksa, sadece kendi to-do'larını getir
    else if (req.user?.role !== 'admin') {
      query = query.eq('user_id', req.user?.id);
    }
    // Admin ve user_id yoksa, tüm to-do'ları getir
    
    if (is_completed !== undefined) {
      query = query.eq('is_completed', is_completed === 'true');
    }
    
    query = query.limit(parseInt(limit as string, 10));
    
    const { data, error } = await query;
    
    if (error) {
      res.status(400).json({
        error: 'Database error',
        message: error.message,
      } as ApiResponse<null>);
      return;
    }
    
    res.json({ data } as ApiResponse<typeof data>);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    } as ApiResponse<null>);
  }
});
```

---

## 📝 IMPLEMENTATION CHECKLIST

### Recurring Tasks:
- [ ] Supabase'de migration kontrolü yap
- [ ] Eğer gerekirse migration'ları çalıştır
- [ ] Backend task routes'u kontrol et
- [ ] Frontend form'u kontrol et
- [ ] Test et: Rutin görev oluştur ve tamamla
- [ ] Yeni görev oluştu mu kontrol et

### To-Do List:
- [ ] Backend todos route'una user_id filtresi ekle
- [ ] Frontend PersonalTodoList'e viewMode state ekle
- [ ] Tab sistemi UI ekle
- [ ] fetchTodos fonksiyonunu güncelle
- [ ] To-do listesinde kullanıcı adı göster (admin all view)
- [ ] Test et: Admin olarak kendi ve tüm to-do'ları gör

---

## 🚀 HIZLI BAŞLANGIÇ

### 1. Supabase Migration Kontrolü:
```sql
-- Supabase SQL Editor'de çalıştır:
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name IN ('is_recurring', 'recurrence_pattern', 'task_type');
```

**Eğer 0 satır dönerse:**
- `supabase/migrations/005_recurring_tasks.sql` dosyasını aç
- İçeriği kopyala ve SQL Editor'de çalıştır

### 2. Backend Todos Route Güncelle:
- `backend/src/routes/todos.ts` dosyasını aç
- GET endpoint'ine user_id filtresi ekle (yukarıdaki kodu kullan)

### 3. Frontend PersonalTodoList Güncelle:
- `frontend/src/components/dashboard/PersonalTodoList.tsx` dosyasını aç
- viewMode state ekle
- Tab sistemi ekle
- fetchTodos güncelle

### 4. Test Et:
- Recurring task oluştur ve tamamla
- Admin olarak to-do list'i kontrol et

---

## 💡 NOTLAR

- Backend to-do route zaten admin desteği var ✅
- Frontend'de sadece UI ayrımı yapılması gerekiyor
- Recurring task migration dosyaları hazır, sadece çalıştırılması gerekiyor
- Toplam süre: ~1 saat

---

**Hazırlayan:** Kiro AI Assistant  
**Sonraki Adım:** Supabase migration kontrolü ile başla
