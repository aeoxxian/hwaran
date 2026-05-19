import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getAdminLevel,
  isAdmin,
  roleMatchesReviewer,
  ADMIN_ROLES,
} from "../../src/lib/types";

describe("UserRole helpers", () => {
  it("getAdminLevel: 회장단/관리자 = 3", () => {
    assert.equal(getAdminLevel("회장단"), 3);
    assert.equal(getAdminLevel("관리자"), 3);
  });

  it("getAdminLevel: 국장팀장 = 2, 국원 = 1", () => {
    assert.equal(getAdminLevel("국장팀장"), 2);
    assert.equal(getAdminLevel("국원"), 1);
  });

  it("getAdminLevel: 일반 회원/동아리장 = 0", () => {
    assert.equal(getAdminLevel("회원"), 0);
    assert.equal(getAdminLevel("동아리장"), 0);
    assert.equal(getAdminLevel("부동아리장"), 0);
  });

  it("isAdmin: 관리자 권한이 있는 역할만 true", () => {
    assert.equal(isAdmin("회장단"), true);
    assert.equal(isAdmin("관리자"), true);
    assert.equal(isAdmin("국장팀장"), true);
    assert.equal(isAdmin("국원"), true);
    assert.equal(isAdmin("회원"), false);
  });

  it("ADMIN_ROLES 에는 회장단/국장팀장/국원/관리자가 포함된다", () => {
    for (const role of ["회장단", "국장팀장", "국원", "관리자"] as const) {
      assert.ok(ADMIN_ROLES.includes(role), `expected ${role} in ADMIN_ROLES`);
    }
  });

  it("roleMatchesReviewer: 회장단/관리자는 서로 호환된다", () => {
    assert.equal(roleMatchesReviewer("회장단", "관리자"), true);
    assert.equal(roleMatchesReviewer("관리자", "회장단"), true);
    assert.equal(roleMatchesReviewer("국장팀장", "국장팀장"), true);
    assert.equal(roleMatchesReviewer("국원", "국장팀장"), false);
    assert.equal(roleMatchesReviewer("회원", "국원"), false);
  });
});
