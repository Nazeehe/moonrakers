import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";

import { FACTIONS, type FactionId } from "@/data/factions";
import { ALL_CARDS } from "@/lib/cards";
import { useNegotiationSession } from "@/state/useNegotiationSession";
import type { Allocation, AllocationKind } from "@/types/negotiation";
import type { Card, ContractCard, ResourceType } from "@/types/cards";

import { NegotiationTabs } from "@/components/Negotiation/NegotiationTabs";
import { ContractStatusBanner } from "@/components/Negotiation/ContractStatusBanner";
import { PlayerBox } from "@/components/Negotiation/PlayerBox";
import { ContractDetailPanel } from "@/components/Negotiation/ContractDetailPanel";
import { AssignmentBanner, useAssignmentState } from "@/components/Negotiation/AssignmentModal";
import { EditAllocationModal } from "@/components/Negotiation/EditAllocationModal";
import { CardZoomModal } from "@/components/Armory/CardZoomModal";

export function NegotiationPage() {
  const { session, activeTab, dispatch } = useNegotiationSession();
  const nav = useNavigate();

  const contract = useMemo<ContractCard | null>(() => {
    if (!session) return null;
    const c = ALL_CARDS.find((x) => x.id === session.contractId);
    return c?.category === "contract" ? (c as ContractCard) : null;
  }, [session]);

  const assignment = useAssignmentState();
  const [editing, setEditing] = useState<Allocation | null>(null);
  const [zoom, setZoom] = useState<Card | null>(null);

  if (!session || !activeTab) {
    return <Navigate to="/dispatch" replace />;
  }
  if (!contract) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="mr-label text-mr-alert mb-2">// CONTRACT MISSING</div>
        <p className="text-mr-text-muted mb-5">
          The contract referenced by this session is no longer in the database.
        </p>
        <button
          type="button"
          onClick={() => { dispatch({ type: "DISCARD_SESSION" }); nav("/dispatch"); }}
          className="mr-button px-4 py-2 text-sm"
        >
          Reset and go back
        </button>
      </div>
    );
  }

  function handlePickResource(input: { kind: AllocationKind; resourceType: ResourceType; remaining: number }) {
    if (input.remaining <= 0) return;
    assignment.open(input);
  }

  function handleAssignTo(playerId: FactionId) {
    if (!assignment.pending) return;
    dispatch({
      type: "ADD_ALLOCATION",
      allocation: {
        kind: assignment.pending.kind,
        resourceType: assignment.pending.resourceType,
        count: assignment.count,
        playerId,
      },
    });
    assignment.cancel();
  }

  function reset() {
    if (!confirm("Discard this negotiation session?")) return;
    dispatch({ type: "DISCARD_SESSION" });
    nav("/dispatch");
  }

  return (
    <div
      className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 transition-[padding] duration-150"
      style={{ paddingBottom: assignment.pending ? "8rem" : undefined }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <Link to="/dispatch" className="mr-label hover:text-mr-cyan inline-flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> DISPATCH
        </Link>
        <div className="flex items-center gap-3">
          <span className="mr-label hidden sm:inline">// CONTRACT NEGOTIATION</span>
          <button
            type="button"
            onClick={reset}
            className="mr-label inline-flex items-center gap-1 hover:text-mr-alert"
            title="Discard session"
          >
            <RotateCcw className="w-3 h-3" /> RESET
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mr-panel-soft p-2 mb-3 sm:mb-4">
        <NegotiationTabs session={session} dispatch={dispatch} />
      </div>

      {/* Status banner */}
      <div className="mb-4 sm:mb-5">
        <ContractStatusBanner contract={contract} tab={activeTab} />
      </div>

      {/* Workspace: players + contract */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <section className="lg:col-span-2 order-2 lg:order-1">
          <div className="mr-label mb-2">PLAYERS</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3">
            {FACTIONS.map((f) => {
              const playerAllocs = activeTab.allocations.filter((a) => a.playerId === f.id);
              return (
                <PlayerBox
                  key={f.id}
                  faction={f}
                  isLeader={f.id === session.missionLeader}
                  allocations={playerAllocs}
                  assignmentMode={!!assignment.pending}
                  onAssignClick={() => handleAssignTo(f.id)}
                  onEditAllocation={(a) => setEditing(a)}
                />
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-1 order-1 lg:order-2">
          <ContractDetailPanel
            contract={contract}
            tab={activeTab}
            onPickResource={handlePickResource}
            onZoom={() => setZoom(contract)}
          />
        </section>
      </div>

      <EditAllocationModal
        allocation={editing}
        contract={contract}
        allAllocations={activeTab.allocations}
        onClose={() => setEditing(null)}
        dispatch={dispatch}
      />

      <CardZoomModal card={zoom} onClose={() => setZoom(null)} />

      {/* Floating assignment pill — fixed at bottom, doesn't push layout */}
      <AssignmentBanner
        pending={assignment.pending}
        count={assignment.count}
        onCount={assignment.setCount}
        onCancel={assignment.cancel}
      />
    </div>
  );
}
