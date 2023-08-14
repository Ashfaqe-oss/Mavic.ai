"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("07371b31-037c-4571-9fe3-fb4d0419f52a");
  }, []);

  return null;
};
