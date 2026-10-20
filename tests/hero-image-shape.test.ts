import { describe, it, expect } from "vitest";
import { heroImageFrom, heroImageVars } from "../components/landpro/styles";
import { buildVM } from "../components/landpro/model";

describe("forme de l'image principale du hero", () => {
  it("valeurs invalides ignorées, taille bornée", () => {
    const h = heroImageFrom({
      hero_img_shape: "étoile",
      hero_img_ratio: "2/1",
      hero_img_size: 10,
      hero_img_fit: "cover",
    });
    expect(h).toEqual({
      shape: undefined,
      ratio: undefined,
      fit: "cover",
      pos: undefined,
      size: 40,
      shadow: undefined,
    });
  });
  it("cercle : proportions carrées imposées", () => {
    const { vars, attrs } = heroImageVars(heroImageFrom({ hero_img_shape: "circle", hero_img_ratio: "16/9" }));
    expect(vars["--hx-ratio"]).toBe("1 / 1");
    expect(vars["--hx-radius"]).toBe("50%");
    expect(attrs["data-hx-shape"]).toBe("circle");
  });
  it("rien de réglé : aucune variable posée (template intact)", () => {
    expect(heroImageVars(heroImageFrom({}))).toEqual({ vars: {}, attrs: {} });
    expect(heroImageVars(heroImageFrom({ hero_img_size: 100 })).attrs).toEqual({});
  });
  it("arrive dans le modèle de la page", () => {
    const vm = buildVM({
      name: "X",
      locale: "fr-MA",
      price: 1,
      images: [],
      content: { hero_img_shape: "arch", hero_img_pos: "top" },
    } as any);
    expect(vm.heroImage.shape).toBe("arch");
    expect(vm.heroImage.pos).toBe("top");
  });
});
