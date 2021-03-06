<?php

/*
 * This file is part of the Sulu.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Component\Content\Document\Subscriber;

use Prophecy\Argument;
use Sulu\Bundle\DocumentManagerBundle\Bridge\DocumentInspector;
use Sulu\Component\Content\Compat\Structure\LegacyPropertyFactory;
use Sulu\Component\Content\ContentTypeInterface;
use Sulu\Component\Content\ContentTypeManagerInterface;
use Sulu\Component\Content\Document\Behavior\StructureBehavior;
use Sulu\Component\Content\Document\Structure\PropertyValue;
use Sulu\Component\Content\Document\Structure\Structure;
use Sulu\Component\Content\Mapper\Translation\TranslatedProperty;
use Sulu\Component\Content\Metadata\PropertyMetadata;
use Sulu\Component\Content\Metadata\StructureMetadata;
use Sulu\Component\DocumentManager\Event\HydrateEvent;
use Sulu\Component\DocumentManager\Event\PersistEvent;

class StructureSubscriberTest extends SubscriberTestCase
{
    /**
     * @var ContentTypeManagerInterface
     */
    private $contentTypeManager;

    /**
     * @var PropertyMetadata
     */
    private $structureProperty;

    /**
     * @var ContentTypeInterface
     */
    private $contentType;

    /**
     * @var PropertyValue
     */
    private $propertyValue;

    /**
     * @var TranslatedProperty
     */
    private $legacyProperty;

    /**
     * @var StructureMetadata
     */
    private $structureMetadata;

    /**
     * @var Structure
     */
    private $structure;

    /**
     * @var LegacyPropertyFactory
     */
    private $propertyFactory;

    /**
     * @var DocumentInspector
     */
    private $inspector;

    /**
     * @var StructureSubscriber
     */
    private $subscriber;

    public function setUp()
    {
        parent::setUp();
        $this->contentTypeManager = $this->prophesize(ContentTypeManagerInterface::class);

        $this->structureProperty = $this->prophesize(PropertyMetadata::class);
        $this->contentType = $this->prophesize(ContentTypeInterface::class);
        $this->propertyValue = $this->prophesize(PropertyValue::class);
        $this->legacyProperty = $this->prophesize(TranslatedProperty::class);
        $this->structureMetadata = $this->prophesize(StructureMetadata::class);
        $this->structure = $this->prophesize(Structure::class);
        $this->propertyFactory = $this->prophesize(LegacyPropertyFactory::class);
        $this->inspector = $this->prophesize(DocumentInspector::class);

        $this->subscriber = new StructureSubscriber(
            $this->encoder->reveal(),
            $this->contentTypeManager->reveal(),
            $this->inspector->reveal(),
            $this->propertyFactory->reveal()
        );
    }

    /**
     * It should return early if the document is not implementing the behavior.
     */
    public function testPersistNotImplementing()
    {
        $this->persistEvent->getDocument()->willReturn($this->notImplementing);
        $this->subscriber->handlePersist($this->persistEvent->reveal());
    }

    /**
     * It should return early if the structure type is empty.
     */
    public function testPersistNoStructureType()
    {
        $document = new TestContentDocument($this->structure->reveal());

        // map the structure type
        $this->persistEvent->getDocument()->willReturn($document);
        $this->subscriber->handlePersist($this->persistEvent->reveal());
    }

    /**
     * It should return early if the locale is null.
     */
    public function testPersistNoLocale()
    {
        $document = new TestContentDocument($this->structure->reveal());
        $this->persistEvent->getLocale()->willReturn(null);
        $this->persistEvent->getDocument()->willReturn($document);

        $this->subscriber->handlePersist($this->persistEvent->reveal());

        $this->node->setProperty()->shouldNotBeCalled();
    }

    /**
     * It should set the structure type and map the content to thethe node.
     */
    public function testPersist()
    {
        $document = new TestContentDocument($this->structure->reveal());
        $document->setStructureType('foobar');
        $this->persistEvent->getDocument()->willReturn($document);

        // map the structure type
        $this->persistEvent->getLocale()->willReturn('fr');
        $this->encoder->contentName('template')->willReturn('i18n:fr-template');
        $this->node->setProperty('i18n:fr-template', 'foobar')->shouldBeCalled();

        // map the content
        $this->inspector->getStructureMetadata($document)->willReturn($this->structureMetadata->reveal());
        $this->inspector->getWebspace($document)->willReturn('webspace');
        $this->structureMetadata->getProperties()->willReturn([
            'prop1' => $this->structureProperty->reveal(),
        ]);
        $this->structureProperty->isRequired()->willReturn(true);
        $this->structureProperty->getContentTypeName()->willReturn('content_type');
        $this->contentTypeManager->get('content_type')->willReturn($this->contentType->reveal());
        $this->propertyFactory->createTranslatedProperty($this->structureProperty->reveal(), 'fr')->willReturn($this->legacyProperty->reveal());
        $this->structure->getProperty('prop1')->willReturn($this->propertyValue->reveal());
        $this->propertyValue->getValue()->willReturn('test');

        $this->contentType->remove(
            $this->node->reveal(),
            $this->legacyProperty->reveal(),
            'webspace',
            'fr',
            null
        )->shouldBeCalled();

        $this->contentType->write(
            $this->node->reveal(),
            $this->legacyProperty->reveal(),
            null,
            'webspace',
            'fr',
            null
        )->shouldBeCalled();

        $this->subscriber->handlePersist($this->persistEvent->reveal());
    }

    /**
     * It should throw an exception if the property is required but the value is null.
     *
     * @expectedException Sulu\Component\Content\Exception\MandatoryPropertyException
     */
    public function testThrowExceptionPropertyRequired()
    {
        $document = new TestContentDocument($this->structure->reveal());
        $document->setStructureType('foobar');
        $this->persistEvent->getDocument()->willReturn($document);

        // map the structure type
        $this->persistEvent->getLocale()->willReturn('fr');

        // map the content
        $this->inspector->getStructureMetadata($document)->willReturn($this->structureMetadata->reveal());
        $this->inspector->getWebspace($document)->willReturn('webspace');
        $this->structureMetadata->getProperties()->willReturn([
            'prop1' => $this->structureProperty->reveal(),
        ]);
        $this->structureProperty->isRequired()->willReturn(true);
        $this->structure->getProperty('prop1')->willReturn($this->propertyValue->reveal());
        $this->propertyValue->getValue()->willReturn(null);
        $this->structureMetadata->getName()->willReturn('test');
        $this->structureMetadata->getResource()->willReturn('/path/to/resource.xml');

        $this->subscriber->handlePersist($this->persistEvent->reveal());
    }

    /**
     * It should return early when not implementing.
     */
    public function testHydrateNotImplementing()
    {
        $this->hydrateEvent->getDocument()->willReturn($this->notImplementing);
        $this->subscriber->handleHydrate($this->hydrateEvent->reveal());
    }

    /**
     * It should set the created and updated fields on the document.
     */
    public function testHydrate()
    {
        $document = new TestContentDocument();
        $this->hydrateEvent->getDocument()->willReturn($document);
        $this->hydrateEvent->getNode()->willReturn($this->node->reveal());
        $this->hydrateEvent->getLocale()->willReturn('fr');
        $this->hydrateEvent->getOption('load_ghost_content', false)->willReturn(true);

        // set the structure type
        $this->encoder->contentName('template')->willReturn('i18n:fr-template');
        $this->node->getPropertyValueWithDefault('i18n:fr-template', null)->willReturn('foobar');

        // set the property container
        $this->subscriber->handleHydrate($this->hydrateEvent->reveal());
        $this->assertEquals('foobar', $document->getStructureType());
        $this->accessor->set('structure', Argument::type(Structure::class))->shouldHaveBeenCalled();
    }
}

class TestContentDocument implements StructureBehavior
{
    private $structureType;
    private $structure;
    private $locale;

    public function __construct(Structure $structure = null)
    {
        $this->structure = $structure;
    }

    public function getStructureType()
    {
        return $this->structureType;
    }

    public function setStructureType($structureType)
    {
        $this->structureType = $structureType;
    }

    public function getStructure()
    {
        return $this->structure;
    }

    public function getLocale()
    {
        return $this->locale;
    }

    public function setLocale($locale)
    {
        $this->locale = $locale;
    }
}
