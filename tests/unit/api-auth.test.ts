import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canManageResource } from "../../src/lib/api-auth";
import type { User } from "../../src/lib/types";

const make = (overrides: Partial<User> = {}): User => ({
  id: "u1",
  name: "테스트",
  email: "u@example.com",
  role: "회원",
  ...overrides,
});

describe("canManageResource", () => {
  it("작성자 본인은 항상 관리 가능", () => {
    const user = make();
    assert.equal(canManageResource(user, "u1"), true);
  });

  it("일반 회원은 다른 사람의 글을 관리할 수 없음", () => {
    const user = make();
    assert.equal(canManageResource(user, "u-other"), false);
  });

  it("국원 이상이면 다른 사람의 글도 관리 가능", () => {
    const user = make({ id: "admin-1", role: "국원" });
    assert.equal(canManageResource(user, "u-other"), true);
  });

  it("회장단은 모든 글 관리 가능 (단계 ≥ 3)", () => {
    const user = make({ id: "admin-3", role: "회장단" });
    assert.equal(canManageResource(user, "u-other", 3), true);
  });

  it("국장팀장은 단계 3 요구 시 거부됨", () => {
    const user = make({ id: "admin-2", role: "국장팀장" });
    assert.equal(canManageResource(user, "u-other", 3), false);
  });

  it("authorId 가 비어 있으면 minAdminLevel 만 검사", () => {
    assert.equal(canManageResource(make({ role: "회원" }), undefined), false);
    assert.equal(canManageResource(make({ role: "국원" }), undefined), true);
  });
});
