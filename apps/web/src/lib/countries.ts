/**
 * Responsibility:
 * Builds the shared country list used by Zionra country and phone selectors.
 * Country names come from the platform internationalization API, while phone
 * calling codes come from libphonenumber-js metadata.
 */

import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

export type CountryOption = {
  code: CountryCode;
  name: string;
  callingCode: string;
  flagUrl: string;
  flagFallback: string;
};

const regionNames = new Intl.DisplayNames(["en"], {
  type: "region",
});

function countryCodeToFlag(code: CountryCode) {
  return code
    .toUpperCase()
    .split("")
    .map((character) =>
      String.fromCodePoint(127397 + character.charCodeAt(0)),
    )
    .join("");
}

export const COUNTRY_OPTIONS: CountryOption[] = getCountries()
  .map((code) => ({
    code,
    name: regionNames.of(code) ?? code,
    callingCode: `+${getCountryCallingCode(code)}`,
    flagUrl: `https://flagcdn.com/w40/${code.toLowerCase()}.png`,
    flagFallback: countryCodeToFlag(code),
  }))
  .sort((firstCountry, secondCountry) =>
    firstCountry.name.localeCompare(secondCountry.name, "en"),
  );

export function getCountryOption(code: CountryCode) {
  return COUNTRY_OPTIONS.find((country) => country.code === code);
}
