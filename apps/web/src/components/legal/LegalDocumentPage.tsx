import type { ReactNode } from "react";
import type { PolicyBlock, PolicyDocument } from "./policyContent";
import Link from "next/link";

export function LegalPageShell({ title, sections, children }: { title: string; sections: { number: number; title: string }[]; children: ReactNode }) {
  return <main className="min-h-screen bg-neutral-01 text-primary-10">
    <div className="mx-auto max-w-[1324px] px-5 py-9 sm:px-10 lg:px-[82px] lg:py-11"><h1 className="font-display text-3xl font-bold tracking-[-0.9px] lg:text-4xl">{title}</h1></div>
    <div className="border-t border-neutral-02 bg-white">
      <div className="mx-auto grid max-w-[1324px] gap-8 px-5 py-8 sm:px-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16 lg:px-[82px] lg:pb-[120px] lg:pt-10">
        <aside className="lg:sticky lg:top-28 lg:h-fit lg:max-h-[calc(100vh-136px)] lg:overflow-y-auto" aria-label="Contents">
          <p className="mb-3 font-sans text-xs font-medium uppercase tracking-[0.08em] text-neutral-05">Contents</p>
          <nav className="flex flex-col gap-0.5">{sections.map(section=><a key={section.number} href={`#section-${section.number}`} className="flex gap-2.5 rounded-lg px-3 py-2 font-sans text-sm leading-5 text-[#3E5775] transition hover:bg-neutral-01 hover:text-primary-10"><span className="w-5 shrink-0 tabular-nums text-neutral-05">{section.number}</span>{section.title}</a>)}</nav>
        </aside>
        <article className="max-w-[760px] font-sans text-base leading-7 text-[#3E5775]">{children}</article>
      </div>
    </div>
  </main>;
}

function PolicyBlockItem({ block }: { block: PolicyBlock }) {
  if (block.type === "subheading") return <h3 className="mt-5 font-display text-base font-semibold text-primary-10">{block.text}</h3>;
  if (block.type === "list") return <li className="ml-6 list-disc pl-1">{block.text}</li>;
  const pieces = block.text.split(/(hello@zionra\.com|support@zionra\.com|www\.zionra\.com)/g);
  return <p className="mt-3">{pieces.map((part,i)=>part.includes('@zionra.com')?<a key={i} href={`mailto:${part}`} className="text-primary-06 hover:underline">{part}</a>:part==='www.zionra.com'?<Link key={i} href="https://www.zionra.com" className="text-primary-06 hover:underline">{part}</Link>:part)}</p>;
}

function Blocks({ blocks }: { blocks: PolicyBlock[] }) {
  const nodes: ReactNode[] = [];
  for (let index=0;index<blocks.length;) {
    if(blocks[index].type==='list') {
      const items: PolicyBlock[]=[];
      while(index<blocks.length && blocks[index].type==='list'){items.push(blocks[index]);index++;}
      nodes.push(<ul key={`list-${index}`} className="mt-3 space-y-1">{items.map((item,j)=><PolicyBlockItem key={j} block={item}/>)}</ul>);
    } else {nodes.push(<PolicyBlockItem key={index} block={blocks[index]}/>);index++;}
  }
  return <>{nodes}</>;
}

export default function LegalDocumentPage({ document }: { document: PolicyDocument }) {
  return <LegalPageShell title={document.title === 'ZIONRA TERMS & CONDITIONS'?'Terms & Conditions':'Refund Policy'} sections={document.sections}>
    <div className="text-lg leading-[30px] text-primary-10"><Blocks blocks={document.preamble}/></div>
    {document.sections.map(section=><section id={`section-${section.number}`} key={section.number} className="mt-10 scroll-mt-28 border-t border-neutral-02 pt-10"><h2 className="flex gap-3 font-display text-xl font-semibold leading-7 text-primary-10"><span className="shrink-0 text-[#3E5775]">{section.number}.</span>{section.title}</h2><Blocks blocks={section.blocks}/></section>)}
  </LegalPageShell>;
}
