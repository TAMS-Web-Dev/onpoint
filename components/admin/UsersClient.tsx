"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, X, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  crisis_flags: number;
  suspended: boolean;
}

type DialogType = "suspend" | "restore" | "remove";

interface DialogState {
  type: DialogType;
  user: UserRow;
}

function StatusBadge({ suspended }: { suspended: boolean }) {
  if (suspended)
    return (
      <span className="inline-flex items-center rounded-full border-2 border-red-200 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-0.5">
        Suspended
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full border-2 border-green-200 bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-0.5">
      Active
    </span>
  );
}

function CrisisBadge({ count }: { count: number }) {
  if (count === 0)
    return (
      <span className="inline-flex items-center rounded-full border-2 border-gray-200 bg-gray-50 text-gray-500 text-xs font-semibold px-2.5 py-0.5">
        0
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full border-2 border-red-200 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-0.5">
      {count}
    </span>
  );
}

const DIALOG_CONFIG: Record<DialogType, { title: string; confirmLabel: string; destructive: boolean }> = {
  suspend: {
    title: "Suspend User",
    confirmLabel: "Suspend",
    destructive: true,
  },
  restore: {
    title: "Restore Access",
    confirmLabel: "Restore",
    destructive: false,
  },
  remove: {
    title: "Remove User",
    confirmLabel: "Remove",
    destructive: true,
  },
};

export default function UsersClient({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [isActing, setIsActing] = useState(false);

  // Debounce search input 300ms, reset to page 1
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Could not load users. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleConfirm() {
    if (!dialog) return;
    setIsActing(true);
    try {
      const { type, user } = dialog;

      if (type === "remove") {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Delete failed");
        toast.success(`${user.email} has been removed.`);
      } else {
        const res = await fetch(`/api/admin/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suspended: type === "suspend" }),
        });
        if (!res.ok) throw new Error("Update failed");
        toast.success(type === "suspend" ? `${user.email} has been suspended.` : `Access restored for ${user.email}.`);
      }

      setDialog(null);
      fetchUsers();
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setIsActing(false);
    }
  }

  const activeDialog = dialog ? DIALOG_CONFIG[dialog.type] : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <span className="text-xs text-gray-600 bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5 ml-2">
            {total}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">Manage platform members</p>
        <hr className="mt-4 border-border" />
      </div>

      {/* Search */}
      <div className="mb-4 relative w-full max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email…"
          className="pl-9 pr-9 h-9 text-sm border-gray-400/50 bg-white"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Crisis Flags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-1">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center text-gray-400 text-sm">
                  {debouncedSearch ? `No users matching "${debouncedSearch}"` : "No users found"}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-semibold text-gray-900">{user.email}</TableCell>
                  <TableCell className="text-gray-900">{user.full_name ?? "—"}</TableCell>
                  <TableCell className="text-gray-900">{format(new Date(user.created_at), "d MMM yyyy")}</TableCell>
                  <TableCell className="text-gray-900">
                    {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), "d MMM yyyy") : "Never"}
                  </TableCell>
                  <TableCell>
                    <CrisisBadge count={user.crisis_flags} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge suspended={user.suspended} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <div className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center rounded-4xl">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal size={16} />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>My Account</DropdownMenuLabel>
                          {user.suspended ? (
                            <DropdownMenuItem onClick={() => setDialog({ type: "restore", user })}>
                              Restore Access
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => setDialog({ type: "suspend", user })}
                              className="text-amber-600 focus:text-amber-600"
                            >
                              Suspend User
                            </DropdownMenuItem>
                          )}
                          {isSuperAdmin && (
                            <DropdownMenuItem
                              onClick={() => setDialog({ type: "remove", user })}
                              className="text-red-600 focus:text-red-600"
                            >
                              Remove User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <ChevronLeft size={15} />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Next
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          {activeDialog && dialog && (
            <>
              <DialogHeader>
                <DialogTitle>{activeDialog.title}</DialogTitle>
              </DialogHeader>

              <p className="text-sm text-gray-500 leading-relaxed">
                {dialog.type === "suspend" && (
                  <>
                    This will prevent <span className="font-medium text-gray-900">{dialog.user.email}</span> from
                    accessing the platform. They will be redirected to a suspended page on next login.
                  </>
                )}
                {dialog.type === "restore" && (
                  <>
                    This will restore platform access for{" "}
                    <span className="font-medium text-gray-900">{dialog.user.email}</span>.
                  </>
                )}
                {dialog.type === "remove" && (
                  <>
                    This will permanently delete <span className="font-medium text-gray-900">{dialog.user.email}</span>{" "}
                    and all associated data. This cannot be undone.
                  </>
                )}
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialog(null)} disabled={isActing}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isActing}
                  variant={activeDialog.destructive ? "destructive" : "default"}
                  className={!activeDialog.destructive ? "bg-[#2D1D44] hover:bg-[#2D1D44]/90 text-white" : undefined}
                >
                  {isActing ? "Please wait…" : activeDialog.confirmLabel}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
