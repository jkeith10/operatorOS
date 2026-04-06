import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  describeLocalInstancePaths,
  expandHomePrefix,
  resolvePaperclipHomeDir,
  resolvePaperclipInstanceId,
} from "../config/home.js";

const ORIGINAL_ENV = { ...process.env };

describe("home path resolution", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("defaults to ~/.operatoros on a fresh home dir and default instance", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "op-home-"));
    const homedirSpy = vi.spyOn(os, "homedir").mockReturnValue(tmp);
    delete process.env.OPERATOROS_HOME;
    delete process.env.PAPERCLIP_HOME;
    delete process.env.PAPERCLIP_INSTANCE_ID;

    try {
      const paths = describeLocalInstancePaths();
      expect(paths.homeDir).toBe(path.join(tmp, ".operatoros"));
      expect(paths.instanceId).toBe("default");
      expect(paths.configPath).toBe(path.join(tmp, ".operatoros", "instances", "default", "config.json"));
    } finally {
      homedirSpy.mockRestore();
    }
  });

  it("prefers ~/.paperclip when ~/.operatoros does not exist but legacy dir does", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "op-home-legacy-"));
    fs.mkdirSync(path.join(tmp, ".paperclip"));
    const homedirSpy = vi.spyOn(os, "homedir").mockReturnValue(tmp);
    delete process.env.OPERATOROS_HOME;
    delete process.env.PAPERCLIP_HOME;
    delete process.env.PAPERCLIP_INSTANCE_ID;

    try {
      expect(resolvePaperclipHomeDir()).toBe(path.join(tmp, ".paperclip"));
    } finally {
      homedirSpy.mockRestore();
    }
  });

  it("prefers OPERATOROS_HOME over PAPERCLIP_HOME when both are set", () => {
    process.env.OPERATOROS_HOME = "~/op-home";
    process.env.PAPERCLIP_HOME = "~/paperclip-home";
    expect(resolvePaperclipHomeDir()).toBe(path.resolve(os.homedir(), "op-home"));
    delete process.env.OPERATOROS_HOME;
  });

  it("supports PAPERCLIP_HOME and explicit instance ids when OPERATOROS_HOME is unset", () => {
    process.env.PAPERCLIP_HOME = "~/paperclip-home";
    delete process.env.OPERATOROS_HOME;

    const home = resolvePaperclipHomeDir();
    expect(home).toBe(path.resolve(os.homedir(), "paperclip-home"));
    expect(resolvePaperclipInstanceId("dev_1")).toBe("dev_1");
  });

  it("rejects invalid instance ids", () => {
    expect(() => resolvePaperclipInstanceId("bad/id")).toThrow(/Invalid instance id/);
  });

  it("expands ~ prefixes", () => {
    expect(expandHomePrefix("~")).toBe(os.homedir());
    expect(expandHomePrefix("~/x/y")).toBe(path.resolve(os.homedir(), "x/y"));
  });
});
