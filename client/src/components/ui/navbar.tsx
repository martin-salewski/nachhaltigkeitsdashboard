import { useTranslation } from "react-i18next";
import Logo from "@/assets/icons/HSM_Logo_Dachmarke_RGB.svg";

function LanguageToggle() {
  const { i18n } = useTranslation();
  const isDeutsch = i18n.language === 'de';
  const toggle = () => {
    i18n.changeLanguage(isDeutsch ? 'en' : 'de');
  };
  return (
    <div className="flex flex-row rounded-lg border border-gray-300 overflow-hidden">
      <button
        onClick={() => i18n.changeLanguage('de')}
        className={`px-3 py-1 text-sm font-medium cursor-pointer ${
          i18n.language === 'de'
            ? 'bg-chart-1 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        DE
      </button>
      <button
        onClick={() => i18n.changeLanguage('en')}
        className={`px-3 py-1 text-sm font-medium cursor-pointer border-l border-gray-300 ${
          i18n.language === 'en'
            ? 'bg-chart-1 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="bg-neutral-primary fixed navigation-minified scroll-hide w-full z-20 top-0 start-0 border-b border-default scene_element scene_element--fadeindown bg-white">
      <div className="flex items-center justify-between w-full max-w-360 mx-auto px-6 py-4">
        <a href="https://www.hs-mainz.de/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src={Logo} className="h-7" alt="Hochschule Mainz - University of Applied Science" />
        </a>

        <LanguageToggle />
      </div>
    </nav>
  );
}

export default Navbar;
