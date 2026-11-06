import { FRAMEWORK_DOCS, type OtherFramework } from '../_lib/framework-demos';
import type {
  FrameworkComponentDocs,
  FrameworkDemo as FrameworkDemoData,
} from '../_lib/framework-docs';
import { withoutListed } from '../_lib/icon-library-variants';

import { CodeSample, ExampleCodeCard } from './CodeSample';
import { ComponentInstallation } from './ComponentInstallation';
import { DescriptionText } from './DescriptionText';
import { FrameworkDemoStage } from './FrameworkDemoStage';
import {
  SECTION_HEADING_CLASS,
  SectionHeading,
  slugify,
  SUBSECTION_HEADING_CLASS,
  SubsectionHeading,
} from './Heading';
import { ExampleInstall } from './InstallBlock';
import { PropsTable } from './PropsTable';

/** These headings share the page with React's, so their ids carry the framework. */
function headingId(framework: OtherFramework, text: string) {
  return `${framework}-${slugify(text)}`;
}

function requireDemo(framework: OtherFramework, id: string): FrameworkDemoData {
  const demo = FRAMEWORK_DOCS[framework].demos[id];
  if (!demo) throw new Error(`No ${framework} demo "${id}".`);
  return demo;
}

/** One docs story: a live app on the stage, the file a reader copies below. */
function ComponentDemo({
  framework,
  demo,
}: {
  framework: OtherFramework;
  demo: FrameworkDemoData;
}) {
  return (
    <ExampleCodeCard
      data-slot="component-demo"
      data-demo={demo.id}
      className="nx:my-6"
      lang={FRAMEWORK_DOCS[framework].lang}
      sources={demo.sources}
      header={
        <div
          data-md-skip
          className="nx:flex nx:min-h-44 nx:items-center nx:justify-center nx:p-8 nx:border-b nx:border-border-default nx:bg-background"
        >
          <FrameworkDemoStage framework={framework} id={demo.id} />
        </div>
      }
    />
  );
}

/** One docs story by framework and id, for MDX pages. */
export function FrameworkDemo({
  framework,
  id,
}: {
  framework: OtherFramework;
  id: string;
}) {
  return (
    <ComponentDemo framework={framework} demo={requireDemo(framework, id)} />
  );
}

/** A framework's panel of a component page, built from its package's docs stories. */
export function FrameworkComponentPanel({
  framework,
  slug,
  docs,
}: {
  framework: OtherFramework;
  slug: string;
  docs: FrameworkComponentDocs;
}) {
  const preview = requireDemo(framework, docs.preview);

  return (
    <>
      <DescriptionText text={docs.description} className="nx:mb-6" />
      <ComponentDemo framework={framework} demo={preview} />
      <ExampleInstall slugs={preview.alsoInstall} packages={preview.packages} />

      <SectionHeading
        id={headingId(framework, 'Installation')}
        className={SECTION_HEADING_CLASS}
      >
        Installation
      </SectionHeading>
      <ComponentInstallation slug={slug} framework={framework} />

      <SectionHeading
        id={headingId(framework, 'Usage')}
        className={SECTION_HEADING_CLASS}
      >
        Usage
      </SectionHeading>
      <CodeSample lang="tsx">{docs.imports}</CodeSample>

      {docs.examples.length > 0 && (
        <SectionHeading
          id={headingId(framework, 'Examples')}
          className={SECTION_HEADING_CLASS}
        >
          Examples
        </SectionHeading>
      )}
      {docs.examples.map((id) => {
        const demo = requireDemo(framework, id);
        return (
          <section key={id}>
            <SubsectionHeading
              id={headingId(framework, `example-${demo.title}`)}
              className={SUBSECTION_HEADING_CLASS}
            >
              {demo.title}
            </SubsectionHeading>
            {demo.description && (
              <DescriptionText text={demo.description} className="nx:mb-4" />
            )}
            <ComponentDemo framework={framework} demo={demo} />
            <ExampleInstall
              slugs={demo.alsoInstall.filter(
                (also) => !preview.alsoInstall.includes(also)
              )}
              packages={withoutListed(demo.packages, preview.packages)}
            />
          </section>
        );
      })}

      <SectionHeading
        id={headingId(framework, 'Props')}
        className={SECTION_HEADING_CLASS}
      >
        Props
      </SectionHeading>
      <PropsTable slug={slug} framework={framework} />
    </>
  );
}
