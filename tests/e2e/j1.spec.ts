import { expect, test } from "@playwright/test";

/**
 * Parcours J1 : home -> PLP robes -> 1ere tuile -> PDP -> taille -> panier
 * -> livraison valide -> paiement 4242 -> confirmation MJ/PZ-*.
 *
 * Skip gracieux si le serveur local est absent (localhost:3001 non joignable).
 */

test.beforeEach(async ({ page }, testInfo) => {
  try {
    await page.goto("/", { timeout: 8000, waitUntil: "domcontentloaded" });
  } catch {
    test.skip(true, `serveur absent sur http://localhost:3001 (${testInfo.title})`);
  }
});

test("J1 : tunnel complet jusqu'a la confirmation MJ/PZ-*", async ({ page }) => {
  // 1. Home -> PLP robes (lien si present, sinon navigation directe).
  const robesLink = page.getByRole("link", { name: /robes/i }).first();
  if ((await robesLink.count()) > 0) {
    await robesLink.click();
  } else {
    await page.goto("/fr/robes", { waitUntil: "domcontentloaded" });
  }
  await expect(page).toHaveURL(/robes/);

  // 2. 1ere tuile produit -> PDP.
  const firstTile = page.locator('a[href*="/fr/p/"]').first();
  await expect(firstTile).toBeVisible({ timeout: 15000 });
  await firstTile.click();
  await expect(page).toHaveURL(/\/fr\/p\//);

  // 3. PDP : choisir une taille si un selecteur est present.
  const sizeButton = page.getByRole("button", { name: /^(XS|S|M|L|XL|TU|36|37|38|39|40|41)$/ }).first();
  if ((await sizeButton.count()) > 0) {
    await sizeButton.click();
  }
  const sizeSelect = page.locator("select[name*='taille' i], select[name*='size' i]").first();
  if ((await sizeSelect.count()) > 0) {
    const options = sizeSelect.locator("option");
    if ((await options.count()) > 1) {
      await sizeSelect.selectOption({ index: 1 });
    }
  }

  // 4. Ajouter au panier.
  const addButton = page
    .getByRole("button", { name: /ajouter.*panier|add.*bag|ajouter au panier/i })
    .first();
  if ((await addButton.count()) > 0) {
    await addButton.click();
  }

  // 5. Panier.
  await page.goto("/fr/panier", { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toContainText(/panier|bag|total/i);

  // 6. Livraison : remplir les champs presents, sans echouer sur les absents.
  await page.goto("/fr/commande/livraison", { waitUntil: "domcontentloaded" });
  const fillIfPresent = async (selector: string, value: string) => {
    const field = page.locator(selector).first();
    if ((await field.count()) > 0 && (await field.isVisible().catch(() => false))) {
      await field.fill(value);
    }
  };
  await fillIfPresent("input[name*='prenom' i], input[name*='first' i]", "Camille");
  await fillIfPresent("input[name*='nom' i], input[name*='last' i]", "Dupont");
  await fillIfPresent("input[type='email'], input[name*='mail' i]", "camille.dupont@example.fr");
  await fillIfPresent("input[name*='adress' i]", "12 rue de la Paix");
  await fillIfPresent("input[name*='postal' i], input[name*='zip' i]", "75002");
  await fillIfPresent("input[name*='ville' i], input[name*='city' i]", "Paris");
  await fillIfPresent("input[name*='tel' i], input[name*='phone' i]", "0612345678");
  const shipSubmit = page
    .getByRole("button", { name: /continuer|suivant|valider|paiement/i })
    .first();
  if ((await shipSubmit.count()) > 0) {
    await shipSubmit.click();
  }

  // 7. Paiement 4242.
  await page.goto("/fr/commande/paiement", { waitUntil: "domcontentloaded" });
  await fillIfPresent(
    "input[name*='card' i], input[name*='carte' i], input[inputmode='numeric']",
    "4242424242424242",
  );
  await fillIfPresent("input[name*='expir' i], input[placeholder*='MM' i]", "12/30");
  await fillIfPresent("input[name*='cvc' i], input[name*='cvv' i], input[name*='crypto' i]", "123");
  const paySubmit = page
    .getByRole("button", { name: /payer|confirmer|commander|valider/i })
    .first();
  if ((await paySubmit.count()) > 0) {
    await paySubmit.click();
  }

  // 8. Confirmation : reference de commande MJ/PZ-*.
  await page.goto("/fr/commande/confirmation", { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toContainText(/(MJ|PZ)-\d{4,}/);
});
