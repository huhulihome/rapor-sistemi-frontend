# 📘 Supabase Migration Nasıl Çalıştırılır?

**Süre:** 5 dakika  
**Zorluk:** Çok Kolay ⭐

---

## 🎯 ADIM ADIM REHBERİ

### Adım 1: Supabase Dashboard'a Giriş Yapın

1. **Tarayıcınızı açın**
2. **https://supabase.com/dashboard** adresine gidin
3. **Giriş yapın** (email/şifre ile)
4. **Projenizi seçin** (rapor-sistemi veya benzeri)

---

### Adım 2: SQL Editor'ı Açın

1. Sol menüden **"SQL Editor"** seçeneğine tıklayın
   - İkon: `</>` (kod işareti)
   - Menüde yukarılarda bulunur

2. **"New query"** butonuna tıklayın
   - Sağ üstte yeşil buton
   - Veya `Ctrl + Enter` kısayolu

---

### Adım 3: Migration Dosyasını Açın

1. **VS Code'da** (veya metin editörünüzde) şu dosyayı açın:
   ```
   SUPABASE_HIZLI_KONTROL.sql
   ```

2. **ADIM 1** bölümünü bulun:
   ```sql
   -- ============================================
   -- ADIM 1: RECURRING TASK KOLONLARINI KONTROL ET
   -- ============================================
   ```

3. **ADIM 1'deki SQL sorgusunu kopyalayın:**
   ```sql
   SELECT 
       column_name, 
       data_type,
       is_nullable
   FROM information_schema.columns 
   WHERE table_name = 'tasks' 
   AND column_name IN (
       'is_recurring', 
       'recurrence_pattern', 
       'recurrence_interval',
       'recurrence_end_date',
       'task_type',
       'start_time',
       'end_time'
   )
   ORDER BY column_name;
   ```

---

### Adım 4: Sorguyu Çalıştırın

1. **Supabase SQL Editor'e geri dönün**
2. **Kopyaladığınız sorguyu yapıştırın**
3. **"RUN" butonuna tıklayın** (veya `Ctrl + Enter`)
   - Sağ üstte mavi buton

4. **Sonucu kontrol edin:**
   - ✅ **7 satır döndüyse:** Kolonlar mevcut, ADIM 3'e geçin
   - ❌ **0 satır döndüyse:** ADIM 2'yi çalıştırın

---

### Adım 5A: Eğer 0 Satır Döndüyse (Kolonlar Yok)

1. **`SUPABASE_HIZLI_KONTROL.sql` dosyasında ADIM 2'yi bulun**

2. **Yorum satırlarını kaldırın:**
   - `/*` ve `*/` işaretlerini silin
   - Veya doğrudan aşağıdaki kodu kullanın:

```sql
-- Add recurring task fields
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'one_time' CHECK (task_type IN ('one_time', 'routine', 'project'));

-- Add time fields for tasks
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME;

-- Add completed_at timestamp
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Create index for recurring tasks
CREATE INDEX IF NOT EXISTS idx_tasks_recurring ON tasks(is_recurring, recurrence_pattern) WHERE is_recurring = TRUE;
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
```

3. **Supabase SQL Editor'e yapıştırın**
4. **"RUN" butonuna tıklayın**
5. **Başarılı mesajı görmelisiniz:** ✅ "Success. No rows returned"

6. **ADIM 1'i tekrar çalıştırın** (kontrol için)
   - Şimdi 7 satır dönmeli ✅

---

### Adım 5B: Eğer 7 Satır Döndüyse (Kolonlar Mevcut)

**Harika! Kolonlar zaten var. ADIM 3'e geçin.**

---

### Adım 6: Trigger Fonksiyonunu Kontrol Edin

1. **`SUPABASE_HIZLI_KONTROL.sql` dosyasında ADIM 3'ü bulun**

2. **Sorguyu kopyalayın:**
```sql
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name = 'create_next_recurring_task'
AND routine_schema = 'public';
```

3. **Supabase SQL Editor'e yapıştırın**
4. **"RUN" butonuna tıklayın**

5. **Sonucu kontrol edin:**
   - ✅ **1 satır döndüyse:** Fonksiyon mevcut, ADIM 5'e geçin
   - ❌ **0 satır döndüyse:** ADIM 4'ü çalıştırın

---

### Adım 7A: Eğer Fonksiyon Yoksa (0 Satır)

1. **`SUPABASE_HIZLI_KONTROL.sql` dosyasında ADIM 4'ü bulun**

2. **Yorum satırlarını kaldırın veya doğrudan şu kodu kullanın:**

```sql
-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS create_recurring_task_trigger ON tasks;

-- Drop existing function if exists
DROP FUNCTION IF EXISTS create_next_recurring_task();

-- Create function to generate next recurring task
CREATE OR REPLACE FUNCTION create_next_recurring_task()
RETURNS TRIGGER AS $$
DECLARE
    next_due_date DATE;
    interval_text TEXT;
BEGIN
    -- Only proceed if task is recurring and being marked as completed
    IF NEW.is_recurring = TRUE 
       AND NEW.status = 'completed' 
       AND (OLD.status IS NULL OR OLD.status != 'completed')
       AND NEW.recurrence_pattern IS NOT NULL THEN
        
        -- Calculate next due date based on pattern and interval
        CASE NEW.recurrence_pattern
            WHEN 'daily' THEN
                interval_text := NEW.recurrence_interval || ' days';
            WHEN 'weekly' THEN
                interval_text := (NEW.recurrence_interval * 7) || ' days';
            WHEN 'biweekly' THEN
                interval_text := (NEW.recurrence_interval * 14) || ' days';
            WHEN 'monthly' THEN
                interval_text := NEW.recurrence_interval || ' months';
            WHEN 'yearly' THEN
                interval_text := NEW.recurrence_interval || ' years';
            ELSE
                interval_text := '1 week';
        END CASE;
        
        -- Calculate next due date
        next_due_date := COALESCE(NEW.due_date, CURRENT_DATE) + interval_text::INTERVAL;
        
        -- Check if we should create next task
        IF NEW.recurrence_end_date IS NULL OR next_due_date <= NEW.recurrence_end_date THEN
            -- Insert new recurring task
            INSERT INTO tasks (
                title,
                description,
                category,
                priority,
                assigned_to,
                created_by,
                due_date,
                start_time,
                end_time,
                estimated_hours,
                tags,
                is_recurring,
                recurrence_pattern,
                recurrence_interval,
                recurrence_end_date,
                task_type,
                status,
                progress_percentage
            ) VALUES (
                NEW.title,
                NEW.description,
                NEW.category,
                NEW.priority,
                NEW.assigned_to,
                NEW.created_by,
                next_due_date,
                NEW.start_time,
                NEW.end_time,
                NEW.estimated_hours,
                NEW.tags,
                NEW.is_recurring,
                NEW.recurrence_pattern,
                NEW.recurrence_interval,
                NEW.recurrence_end_date,
                NEW.task_type,
                'not_started',
                0
            );
            
            RAISE NOTICE 'Created next recurring task with due date: %', next_due_date;
        ELSE
            RAISE NOTICE 'Recurring task series ended';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER create_recurring_task_trigger
    AFTER UPDATE OF status ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION create_next_recurring_task();
```

3. **Supabase SQL Editor'e yapıştırın**
4. **"RUN" butonuna tıklayın**
5. **Başarılı mesajı görmelisiniz:** ✅ "Success. No rows returned"

6. **ADIM 3'ü tekrar çalıştırın** (kontrol için)
   - Şimdi 1 satır dönmeli ✅

---

### Adım 8: Trigger'ın Aktif Olduğunu Doğrulayın

1. **`SUPABASE_HIZLI_KONTROL.sql` dosyasında ADIM 5'i bulun**

2. **Sorguyu kopyalayın:**
```sql
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'create_recurring_task_trigger'
AND event_object_table = 'tasks';
```

3. **Supabase SQL Editor'e yapıştırın**
4. **"RUN" butonuna tıklayın**

5. **Sonuç:**
   - ✅ **1 satır döndüyse:** TAMAMLANDI! 🎉
   - ❌ **0 satır döndüyse:** ADIM 4'ü tekrar çalıştırın

---

## ✅ TAMAMLANDI!

Eğer son adımda 1 satır döndüyse, migration başarıyla tamamlandı!

**Artık:**
- ✅ Recurring task kolonları eklendi
- ✅ Trigger fonksiyonu oluşturuldu
- ✅ Trigger aktif edildi
- ✅ Rutin görevler tamamlandığında yeni görev otomatik oluşacak

---

## 🧪 TEST (Opsiyonel)

Migration'ın çalıştığını test etmek için:

1. **Uygulamanıza gidin**
2. **Yeni görev oluşturun:**
   - Görev Tipi: "🔄 Rutin (Tekrarlayan)"
   - Tekrar Sıklığı: "Her Hafta"
   - İlk Bitiş Tarihi: Bugün
3. **Görevi kaydedin**
4. **Görevi "Tamamlandı" olarak işaretleyin**
5. **Görev listesini yenileyin**
6. **Yeni görev oluştu mu kontrol edin** (1 hafta sonraki tarihle)

**Eğer yeni görev oluştuysa:** ✅ Her şey çalışıyor!

---

## 🆘 SORUN GİDERME

### Sorun: "Permission denied" hatası
**Çözüm:** Supabase'de admin yetkileriniz var mı kontrol edin

### Sorun: Trigger çalışmıyor
**Çözüm:** 
1. ADIM 5'i tekrar çalıştırın
2. Trigger'ın aktif olduğunu doğrulayın
3. Supabase Dashboard > Database > Triggers bölümünden kontrol edin

### Sorun: Yeni görev oluşmuyor
**Çözüm:**
1. Task'ın `is_recurring = TRUE` olduğundan emin olun
2. Task'ın `status = 'completed'` olarak güncellendiğinden emin olun
3. Browser console'da hata var mı kontrol edin

---

## 📚 ÖZET

**Yapmanız gerekenler:**
1. ✅ Supabase Dashboard'a giriş yapın
2. ✅ SQL Editor'ı açın
3. ✅ ADIM 1'i çalıştırın (kontrol)
4. ✅ Gerekirse ADIM 2'yi çalıştırın (kolonlar)
5. ✅ ADIM 3'ü çalıştırın (kontrol)
6. ✅ Gerekirse ADIM 4'ü çalıştırın (trigger)
7. ✅ ADIM 5'i çalıştırın (doğrulama)

**Tahmini Süre:** 5 dakika  
**Zorluk:** Çok Kolay ⭐

---

**Hazırlayan:** Kiro AI Assistant  
**Dosya:** `SUPABASE_HIZLI_KONTROL.sql` kullanın
