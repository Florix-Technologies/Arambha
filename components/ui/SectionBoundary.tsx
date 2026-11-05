"use client";
import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode; name: string; fallback?: ReactNode };
type State = { failed: boolean };

/** Keeps one broken section from taking the rest of the page down with it. */
export default class SectionBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error(`The "${this.props.name}" section failed to load:`, error);
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
