/*
  # Add washed status and fix Ultimate Package features

  1. Changes
    - Adds 'Lorry / Truck / Commercial Vehicles / Camper -- £280' to Ultimate Package features list
    - Documents the new 'washed' booking status for use in the admin booking management flow

  2. Notes
    - The bookings.status column is a text field, so no schema change is needed to support 'washed'
    - This migration updates the Ultimate Package features to include the missing commercial vehicle pricing tier
*/

UPDATE services
SET features = jsonb_build_array(
  'Deep shampoo cleaning of seats',
  'Fabric and leather seat treatment',
  'Dashboard deep cleaning',
  'Centre console cleaning',
  'Door panel cleaning,  Full interior surface wipe',
  'Full exterior wash',
  'Exterior shampoo treatment,  Professional polish',
  'Alloy wheel deep cleaning,  Window cleaning',
  'Stain remover for tough spots and marks',
  'Car — £155',
  'Van — £200',
  'Lorry / Truck / Commercial Vehicles / Camper — £280'
)
WHERE name = 'Ultimate Package';
