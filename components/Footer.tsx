// components/Footer.tsx
import Link from "next/link";
import { useTranslation } from "next-i18next";

export default function Footer() {
  const { t } = useTranslation("home");

  return (
    <footer className="mt-12 bg-gray-900 py-10 text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-3">
        <div>
          <h4 className="text-xl font-bold text-white">MotorWelt</h4>
          <p className="mt-2 text-sm">{t("footer.description")}</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold">{t("footer.links")}</h4>
          <ul className="mt-2 space-y-2 text-sm">
            <li><Link href="/about">{t("footer.about")}</Link></li>
            <li><Link href="/contact">Contacto</Link></li>
            <li><Link href="/terminos">Términos y condiciones</Link></li>
            <li><Link href="/privacidad">Política de privacidad</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold">{t("footer.socials")}</h4>
          <div className="mt-2 flex gap-4">
            {/* ⚠️ Revisa el handle de IG: en tu código había "motorwel_t" (¿typo?). Si es "motorwelt", usa el de abajo */}
            <a href="https://instagram.com/motorwelt" target="_blank" rel="noreferrer">IG</a>
            <a href="https://facebook.com/motorwelt" target="_blank" rel="noreferrer">FB</a>
            <a href="https://tiktok.com/@motorwelt" target="_blank" rel="noreferrer">TikTok</a>
            <a href="https://youtube.com/@motorwelt" target="_blank" rel="noreferrer">YouTube</a>
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} MotorWelt. {t("footer.rights")}
      </p>
    </footer>
  );
}
