import {
  ChapterLink,
  ChapterSection,
  GetStartedLink,
} from '../_home/ChapterSection';
import { CoexistPreview } from '../_home/coexist/CoexistPreview';
import { Community } from '../_home/Community';
import { CustomizePreview } from '../_home/customize/CustomizePreview';
import { FrameworksPreview } from '../_home/frameworks/FrameworksPreview';
import { GalleryPreview } from '../_home/gallery/GalleryPreview';
import { highlightStories } from '../_home/stories/story-code';
import { StorybookLink } from '../_home/stories/StorybookLink';
import { StoryTestIterations } from '../_home/stories/StoryTestIterations';
import { requirePage, requireSection } from '../_lib/manifest';
import {
  NPM_CORE_URL,
  pageMetadata,
  REPO_URL,
  SITE_ALTERNATE_NAMES,
  SITE_DESCRIPTION,
  SITE_IMAGE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  STORYBOOK_URL,
} from '../_lib/site';

export const metadata = pageMetadata({
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  route: '/',
  image: SITE_IMAGE,
});

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAMES,
      description: SITE_DESCRIPTION,
    },
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${SITE_URL}/#software`,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAMES,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      codeRepository: REPO_URL,
      programmingLanguage: ['TypeScript', 'CSS'],
      license: 'https://opensource.org/licenses/MIT',
      author: {
        '@type': 'Organization',
        name: 'Nexus Labs',
        url: 'https://github.com/nexuslabs-ai',
      },
      sameAs: [REPO_URL, NPM_CORE_URL, STORYBOOK_URL],
    },
  ],
};

export default async function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // `<` is escaped so no string in the data can close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(STRUCTURED_DATA).replaceAll('<', '\\u003c'),
        }}
      />
      {/* Each chapter's title and links render on the server; its preview and
          toolbar are the client part. The section ids are the page's links. */}
      <div className="nx:home-journey">
        <ChapterSection
          id="explore"
          level={1}
          title="Your design system starts here."
          actions={
            <>
              <GetStartedLink />
              <ChapterLink
                href={requireSection('components').href}
                label="View components"
              />
            </>
          }
        >
          <GalleryPreview />
        </ChapterSection>
        <ChapterSection
          id="customize"
          title="Customize every detail."
          subtitle="Change one setting. See your system respond."
          actions={<ChapterLink href="/playground" label="Open Playground" />}
        >
          <CustomizePreview />
        </ChapterSection>
        <ChapterSection
          id="coexist"
          title="Your next component shouldn’t change the rest."
          subtitle="Nexus components bring their own styles, so you can add what you need while keeping the look and feel you’ve already built."
          actions={
            <ChapterLink
              href={requirePage('integrations', 'overview').route}
              label="Explore integrations"
            />
          }
          className="nx:coexist-section"
        >
          <CoexistPreview />
        </ChapterSection>
        <ChapterSection
          id="frameworks"
          title="One foundation. Many frameworks."
          actions={
            <ChapterLink
              href={requirePage('foundations', 'tokens').route}
              label="Explore the engine"
            />
          }
        >
          <FrameworksPreview />
        </ChapterSection>
        <ChapterSection
          id="stories"
          title="Stories are the tests."
          subtitle="The example you explore is the example we check."
          actions={<StorybookLink />}
          className="nx:stories-section"
        >
          <StoryTestIterations storyCode={await highlightStories()} />
        </ChapterSection>
        <Community />
      </div>
    </>
  );
}
