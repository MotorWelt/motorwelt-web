import autosPageSettings from "./autosPageSettings";
import article from "./article";
import adminUser from "./adminUser";
import marketListing from "./marketListing";
import homeSettings from "./homeSettings";

export const schemaTypes = [
  article,
  adminUser,
  marketListing,
  homeSettings,
  autosPageSettings, // 👈 IMPORTANTE
];