-- Controle de concorrência otimista: evita que duas atualizações simultâneas
-- do mesmo pedido sobrescrevam uma à outra.
ALTER TABLE orders ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
