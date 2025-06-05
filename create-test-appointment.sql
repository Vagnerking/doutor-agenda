-- Inserir um agendamento de teste
INSERT INTO appointments (
  id,
  date,
  time,
  appointment_price_in_cents,
  patient_id,
  doctor_id,
  clinic_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '2025-06-10'::timestamp,
  '09:30'::time,
  15000,
  (SELECT id FROM patients LIMIT 1),
  (SELECT id FROM doctors LIMIT 1),
  (SELECT id FROM clinics LIMIT 1),
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING; 