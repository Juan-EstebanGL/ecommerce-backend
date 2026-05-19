/*
  Warnings:

  - This migration moves CartItem ownership from Cart to User.
  - The Cart table will be dropped after existing CartItem rows receive their userId.
  - The unique index on (userId, productId) will fail if a user already has duplicate rows for the same product.
*/

ALTER TABLE "CartItem" ADD COLUMN "userId" INTEGER;

UPDATE "CartItem"
SET "userId" = "Cart"."userId"
FROM "Cart"
WHERE "CartItem"."cartId" = "Cart"."id";

ALTER TABLE "CartItem" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "CartItem" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "CartItem" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_cartId_fkey";
ALTER TABLE "CartItem" DROP COLUMN "cartId";

DROP TABLE "Cart";

ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "CartItem_userId_productId_key" ON "CartItem"("userId", "productId");
